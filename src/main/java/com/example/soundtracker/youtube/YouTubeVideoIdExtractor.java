package com.example.soundtracker.youtube;

import java.net.URI;

public class YouTubeVideoIdExtractor {

    // Supports:
    // - https://youtube.com/shorts/{id}
    // - https://www.youtube.com/watch?v={id}
    // - https://youtu.be/{id}
    public static String extract(String url) {
        URI uri = URI.create(url.trim());
        String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase();
        String path = uri.getPath() == null ? "" : uri.getPath();

        if (path.startsWith("/shorts/")) {
            return stripExtras(path.substring("/shorts/".length()));
        }

        if (host.contains("youtu.be")) {
            String id = path.startsWith("/") ? path.substring(1) : path;
            return stripExtras(id);
        }

        if (path.equals("/watch")) {
            String q = uri.getQuery();
            if (q == null) throw new IllegalArgumentException("Missing query parameters in watch URL");
            for (String part : q.split("&")) {
                String[] kv = part.split("=", 2);
                if (kv.length == 2 && kv[0].equals("v")) {
                    return stripExtras(kv[1]);
                }
            }
            throw new IllegalArgumentException("No v= parameter in watch URL");
        }

        throw new IllegalArgumentException("Unsupported YouTube URL format: " + url);
    }

    private static String stripExtras(String raw) {
        // remove anything after non video-id characters
        return raw.replaceAll("[^a-zA-Z0-9_-].*$", "");
    }
}