package {{packageName}};

import java.util.HashMap;
import java.util.Map;
import java.net.URL;
import java.net.URLConnection;
import java.io.BufferedReader;
import java.io.InputStreamReader;

/**
 * {{extensionName}} - External Data Fetcher
 *
 * Purpose: {{description}}
 * Target Fields: {{targetFields}}
 * API Endpoint: {{apiEndpoint}}
 * Created: {{createdDate}}
 */
public class {{className}} {

    private final String name;
    private final Map<String, String> config;
    private static final int TIMEOUT = {{timeout}};

    public {{className}}(String name, Map<String, String> config) {
        this.name = name;
        this.config = config != null ? new HashMap<>(config) : new HashMap<>();
    }

    public String getName() {
        return name;
    }

    public Map<String, Object> process(Map<String, Object> document) {
        try {
            // Extract key for API lookup
            {{keyExtraction}}

            // Fetch data from external API
            {{fetchData}}

            // Merge fetched data into document
            {{mergeData}}

            // Custom processing logic
            {{customLogic}}

            return document;
        } catch (Exception e) {
            System.err.println("Error fetching external data: " + e.getMessage());
            e.printStackTrace();
            return document;
        }
    }

    public void init(Map<String, String> config) {
        // Initialize HTTP client, connection pool, etc.
        {{initLogic}}
    }

    public void destroy() {
        // Close connections and cleanup resources
        {{cleanupLogic}}
    }

    // HTTP GET request
    private String fetchFromAPI(String url) throws Exception {
        URL apiUrl = new URL(url);
        URLConnection connection = apiUrl.openConnection();
        connection.setConnectTimeout(TIMEOUT);
        connection.setReadTimeout(TIMEOUT);

        BufferedReader reader = new BufferedReader(
            new InputStreamReader(connection.getInputStream(), "UTF-8")
        );
        StringBuilder response = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            response.append(line);
        }
        reader.close();

        return response.toString();
    }

    {{customMethods}}
}
