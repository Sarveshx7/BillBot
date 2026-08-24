package com.billbot.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

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

        // 1. Check if cloud PostgreSQL URL (e.g. Render / Supabase / Neon: postgres://user:pass@host:port/db)
        if (activeUrl != null && !activeUrl.trim().isEmpty()) {
            activeUrl = activeUrl.trim();
            if (activeUrl.startsWith("postgres://") || activeUrl.startsWith("postgresql://")) {
                try {
                    URI dbUri = new URI(activeUrl);
                    String username = "";
                    String password = "";
                    if (dbUri.getUserInfo() != null) {
                        String[] userInfo = dbUri.getUserInfo().split(":", 2);
                        username = userInfo[0];
                        if (userInfo.length > 1) {
                            password = userInfo[1];
                        }
                    }

                    int port = dbUri.getPort() == -1 ? 5432 : dbUri.getPort();
                    String host = dbUri.getHost();
                    String path = dbUri.getPath();
                    if (!path.startsWith("/")) {
                        path = "/" + path;
                    }

                    String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;
                    if (dbUri.getQuery() != null && !dbUri.getQuery().isEmpty()) {
                        jdbcUrl += "?" + dbUri.getQuery();
                    }

                    System.out.println("[DatabaseConfig] Connecting to Cloud PostgreSQL: " + host + ":" + port + path);

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

        // 2. Persistent file-based H2 fallback (survives restarts on local / persistent disks)
        String fallbackFileUrl = "jdbc:h2:file:./data/billbotdb;AUTO_SERVER=TRUE;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH";
        System.out.println("[DatabaseConfig] Using persistent H2 file database: " + fallbackFileUrl);
        return DataSourceBuilder.create()
                .url(fallbackFileUrl)
                .username("sa")
                .password("")
                .driverClassName("org.h2.Driver")
                .build();
    }
}