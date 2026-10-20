package com.billbot.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Configuration
public class DatabaseConfig {

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Value("${DB_URL:}")
    private String dbUrl;

    @Value("${DB_USERNAME:sa}")
    private String dbUsername;

    @Value("${DB_PASSWORD:}")
    private String dbPassword;

    @Value("${DB_REQUIRED:false}")
    private boolean databaseRequired;

    @Bean
    @Primary
    public DataSource dataSource() {
        String activeUrl = databaseUrl;
        if (activeUrl == null || activeUrl.trim().isEmpty()) {
            activeUrl = dbUrl;
        }

        // 1. Check if Cloud PostgreSQL URL (Supabase / Render / Neon / Railway)
        if (activeUrl != null && !activeUrl.trim().isEmpty()) {
            activeUrl = activeUrl.trim();
            if (activeUrl.startsWith("postgres://") || activeUrl.startsWith("postgresql://")) {
                try {
                    String username;
                    String password;
                    String host;
                    int port;
                    String path;
                    String queryParams;

                    // Some providers return credentials with unescaped URI-reserved
                    // characters (for example @ or #). Parse that common form before
                    // using URI, which treats those characters as authority/fragment delimiters.
                    Pattern connectionPattern = Pattern.compile(
                            "^(?:postgres|postgresql)://([^:/?#]+):(.+)@([^:/?#]+)(?::(\\d+))?(/[^?]*)?(?:\\?(.*))?$"
                    );
                    Matcher matcher = connectionPattern.matcher(activeUrl);
                    if (matcher.matches()) {
                        username = decodeUriComponent(matcher.group(1));
                        password = decodeUriComponent(matcher.group(2));
                        host = matcher.group(3);
                        port = matcher.group(4) == null ? 5432 : Integer.parseInt(matcher.group(4));
                        path = matcher.group(5);
                        queryParams = matcher.group(6);
                    } else {
                        URI dbUri = URI.create(activeUrl);
                        host = dbUri.getHost();
                        String rawUserInfo = dbUri.getRawUserInfo();
                        if (host == null) {
                            throw new IllegalArgumentException("PostgreSQL URL must include a valid host name");
                        }
                        if (rawUserInfo == null) {
                            throw new IllegalArgumentException("PostgreSQL URL must include username and password credentials");
                        }

                        int separator = rawUserInfo.indexOf(':');
                        if (separator < 1 || separator == rawUserInfo.length() - 1) {
                            throw new IllegalArgumentException("PostgreSQL URL must include a username and password");
                        }

                        username = decodeUriComponent(rawUserInfo.substring(0, separator));
                        password = decodeUriComponent(rawUserInfo.substring(separator + 1));
                        port = dbUri.getPort() == -1 ? 5432 : dbUri.getPort();
                        path = dbUri.getRawPath();
                        queryParams = dbUri.getRawQuery();
                    }

                    if (path == null || path.isBlank() || path.equals("/")) {
                        path = "/postgres";
                    }
                    if (host.toLowerCase(Locale.ROOT).endsWith(".pooler.supabase.com")
                            && (queryParams == null || !queryParams.toLowerCase(Locale.ROOT).contains("sslmode="))) {
                        queryParams = queryParams == null || queryParams.isBlank()
                                ? "sslmode=require"
                                : queryParams + "&sslmode=require";
                    }
                    String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;
                    if (queryParams != null && !queryParams.isBlank()) {
                        jdbcUrl += "?" + queryParams;
                    }

                    System.out.println("[DatabaseConfig] Connecting to PostgreSQL host: " + host + " (port " + port + ")");

                    return DataSourceBuilder.create()
                            .url(jdbcUrl)
                            .username(username)
                            .password(password)
                            .driverClassName("org.postgresql.Driver")
                            .build();
                } catch (Exception e) {
                    throw new IllegalStateException("Could not configure the PostgreSQL database from DATABASE_URL/DB_URL", e);
                }
            } else if (activeUrl.startsWith("jdbc:")) {
                String driver;
                if (activeUrl.startsWith("jdbc:postgresql:")) {
                    driver = "org.postgresql.Driver";
                } else if (activeUrl.startsWith("jdbc:h2:")) {
                    driver = "org.h2.Driver";
                } else {
                    throw new IllegalArgumentException("Unsupported JDBC database URL. Use PostgreSQL or H2.");
                }
                System.out.println("[DatabaseConfig] Connecting to JDBC URL: " + activeUrl);
                return DataSourceBuilder.create()
                        .url(activeUrl)
                        .username(dbUsername)
                        .password(dbPassword)
                        .driverClassName(driver)
                        .build();
            }

            throw new IllegalArgumentException("Unsupported database URL. Use a PostgreSQL URI, PostgreSQL JDBC URL, or H2 JDBC URL.");
        }

        if (databaseRequired) {
            throw new IllegalStateException("No database URL is configured. Set DATABASE_URL or DB_URL for this deployment.");
        }

        // 2. Persistent file-based H2 fallback (survives restarts on local)
        String fallbackFileUrl = "jdbc:h2:file:./data/billbotdb;AUTO_SERVER=TRUE;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH";
        System.out.println("[DatabaseConfig] Using persistent local H2 storage: " + fallbackFileUrl);
        return DataSourceBuilder.create()
                .url(fallbackFileUrl)
                .username("sa")
                .password("")
                .driverClassName("org.h2.Driver")
                .build();
    }

    private String decodeUriComponent(String value) {
        // A plus sign is literal in URI user-info (unlike form-encoded data).
        return URLDecoder.decode(value.replace("+", "%2B"), StandardCharsets.UTF_8);
    }
}
