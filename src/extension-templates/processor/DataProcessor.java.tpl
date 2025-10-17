package {{packageName}};

import java.util.HashMap;
import java.util.Map;

/**
 * {{extensionName}} - Data Processor
 *
 * Purpose: {{description}}
 * Target Fields: {{targetFields}}
 * Created: {{createdDate}}
 */
public class {{className}} {

    private final String name;
    private final Map<String, String> config;

    public {{className}}(String name, Map<String, String> config) {
        this.name = name;
        this.config = config != null ? new HashMap<>(config) : new HashMap<>();
    }

    public String getName() {
        return name;
    }

    public Map<String, Object> process(Map<String, Object> document) {
        try {
            if (document == null) {
                return document;
            }

            // Target fields processing
            {{targetFieldsProcessing}}

            // Custom processing logic
            {{customProcessing}}

            return document;
        } catch (Exception e) {
            System.err.println("Error processing document: " + e.getMessage());
            e.printStackTrace();
            return document;
        }
    }

    public void init(Map<String, String> config) {
        // Initialization logic
        {{initLogic}}
    }

    public void destroy() {
        // Cleanup logic
        {{cleanupLogic}}
    }

    // Utility methods
    private String normalizeString(String input) {
        if (input == null) return null;
        return input.trim().toLowerCase();
    }

    {{customMethods}}
}
