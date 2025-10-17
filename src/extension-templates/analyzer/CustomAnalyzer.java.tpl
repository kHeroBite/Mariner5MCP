package {{packageName}};

import java.util.HashMap;
import java.util.Map;
import java.io.Reader;

/**
 * {{extensionName}} - Custom Text Analyzer
 *
 * Purpose: {{description}}
 * Target Fields: {{targetFields}}
 * Created: {{createdDate}}
 */
public class {{className}} {

    private final String name;
    private final Map<String, String> options;

    public {{className}}(String name, Map<String, String> options) {
        this.name = name;
        this.options = options != null ? new HashMap<>(options) : new HashMap<>();
    }

    public String getName() {
        return name;
    }

    public Object tokenStream(String fieldName, Reader reader) {
        // Tokenizer: StandardTokenizer
        // Token Filters
        {{customFilters}}

        return reader;
    }

    public Object tokenStream(String fieldName, String value) {
        return tokenStream(fieldName, new java.io.StringReader(value));
    }

    // Custom processing logic
    {{customMethods}}
}
