package com.billbot.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
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
                    String username = "";
                    String password = "";
                    String host = "";
                    int port = 5432;
                    String database = "/postgres";
                    String queryParams = "";

                    // Regex to handle passwords with special characters (@, #, $, etc.)
                    Pattern pattern = Pattern.compile("^(?:postgres|postgresql)://([^:]+):(.+)@([^:/]+)(?::(\\d+))?(/[^?]+)?(?:\\?(.*))?$");
                    Matcher matcher = pattern.matcher(activeUrl);

                    if (matcher.find()) {
                        username = matcher.group(1);
                        password = matcher.group(2);
                        host = matcher.group(3);
                        if (matcher.group(4) != null) {
                            port = Integer.parseInt(matcher.group(4));
                        }
                        if (matcher.group(5) != null) {
                            database = matcher.group(5);
                        }
                        if (matcher.group(6) != null) {
                            queryParams = matcher.group(6);
                        }
                    } else {
                        // Standard URI fallback
                        URI dbUri = new URI(activeUrl);
                        if (dbUri.getUserInfo() != null) {
                            String[] userInfo = dbUri.getUserInfo().split(":", 2);
                            username = userInfo[0];
                            if (userInfo.length > 1) {
                                password = userInfo[1];
                            }
                        }
                        port = dbUri.getPort() == -1 ? 5432 : dbUri.getPort();
                        host = dbUri.getHost();
                        database = dbUri.getPath();
                        if (dbUri.getQuery() != null) {
                            queryParams = dbUri.getQuery();
                        }
                    }

                    if (!database.startsWith("/")) {
                        database = "/" + database;
                    }

                    String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + database;
                    if (queryParams != null && !queryParams.isEmpty()) {
                        jdbcUrl += "?" + queryParams;
                    }

                    System.out.println("[DatabaseConfig] Connecting to Supabase/PostgreSQL host: " + host + " (port " + port + ")");

                    return DataSourceBuilder.create()
                            .url(jdbcUrl)
                            .username(username)
                            .password(password)
                            .driverClassName("org.postgresql.Driver")
                            .build();
                } catch (Exception e) {
                    System.err.println("[DatabaseConfig] Error parsing DATABASE_URL: " + e.getMessage());
                }
            } else if (activeUrl.startsWith("jdbc:")) {
                String driver = activeUrl.contains("postgresql") ? "org.postgresql.Driver" : "org.h2.Driver";
                System.out.println("[DatabaseConfig] Connecting to JDBC URL: " + activeUrl);
                return DataSourceBuilder.create()
                        .url(activeUrl)
                        .username(dbUsername)
                        .password(dbPassword)
                        .driverClassName(driver)
                        .build();
            }
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
}