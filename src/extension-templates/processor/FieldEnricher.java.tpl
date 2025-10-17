package {{packageName}};

import java.util.HashMap;
import java.util.Map;
import java.util.List;

/**
 * {{extensionName}} - Field Enricher
 *
 * Purpose: {{description}}
 * Target Fields: {{targetFields}}
 * Created: {{createdDate}}
 */
public class {{className}} {

    private final String name;
    private final Map<String, String> config;
    {{customFields}}

    public {{className}}(String name, Map<String, String> config) {
        this.name = name;
        this.config = config != null ? new HashMap<>(config) : new HashMap<>();
    }

    public String getName() {
        return name;
    }

    public Map<String, Object> process(Map<String, Object> document) {
        try {
            // Enrich each target field
            {{enrichTargetFields}}

            // Add new fields
            {{addNewFields}}

            // Custom enrichment logic
            {{customEnrichment}}

            return document;
        } catch (Exception e) {
            System.err.println("Error enriching document: " + e.getMessage());
            e.printStackTrace();
            return document;
        }
    }

    public void init(Map<String, String> config) {
        // Initialize resources (DB connection, API client, cache, etc.)
        {{initLogic}}
    }

    public void destroy() {
        // Release resources
        {{cleanupLogic}}
    }

    // Fetch data from external source
    {{customMethods}}
}
