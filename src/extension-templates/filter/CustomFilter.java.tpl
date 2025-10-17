package {{packageName}};

import java.util.HashMap;
import java.util.Map;

/**
 * {{extensionName}} - Custom Filter
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
            // Apply filtering logic
            {{filteringLogic}}

            // Custom logic
            {{customLogic}}

            return document;
        } catch (Exception e) {
            System.err.println("Error filtering document: " + e.getMessage());
            e.printStackTrace();
            return document;
        }
    }

    public void init(Map<String, String> config) {
        // Initialize filter configuration
        {{initLogic}}
    }

    public void destroy() {
        // Cleanup
        {{cleanupLogic}}
    }

    // Filter check methods
    private boolean shouldInclude(String fieldName, Object fieldValue) {
        {{filterCheckLogic}}
        return true;
    }

    private boolean shouldExclude(String fieldName, Object fieldValue) {
        {{excludeCheckLogic}}
        return false;
    }

    {{customMethods}}
}
