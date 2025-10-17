import dotenv from 'dotenv';
import { http } from '../../http.js';
import { ok, fail, makeValidator, tpl } from '../../utils.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const BASE_URL = process.env.BASE_URL || 'http://localhost:8080/api';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const endpointsJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../config/endpoints.json'), 'utf-8'));

function springBootTemplate(params) {
  const { groupId, artifactId, package:pkg, collection, endpoints } = params;
  return {
    'pom.xml': `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>${groupId}</groupId>
  <artifactId>${artifactId}</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <properties>
    <java.version>17</java.version>
    <spring.boot.version>3.3.3</spring.boot.version>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-thymeleaf</artifactId>
    </dependency>
  </dependencies>
  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
</project>`,
    'src/main/resources/application.yml': `server:
  port: 8081
search:
  baseUrl: ${process.env.BASE_URL || 'http://localhost:8080/api'}
  endpoints:
    search: ${endpoints?.search || '/collections/search'}
    index: ${endpoints?.index || '/collections/index'}
`,
    [`src/main/java/${pkg.replace(/\./g, '/')}/Application.java`]: `package ${pkg};
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
  public static void main(String[] args) {
    SpringApplication.run(Application.class, args);
  }
}`,
    [`src/main/java/${pkg.replace(/\./g, '/')}/SearchController.java`]: `package ${pkg};
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SearchController {
  @Value("${search.baseUrl}") private String baseUrl;
  @Value("${search.endpoints.search}") private String searchEp;

  @PostMapping("/search")
  public ResponseEntity<?> proxySearch(@RequestBody Map<String,Object> body) {
    RestTemplate rt = new RestTemplate();
    String url = baseUrl + searchEp;
    ResponseEntity<Map> res = rt.postForEntity(url, body, Map.class);
    return ResponseEntity.status(res.getStatusCode()).body(res.getBody());
  }
}`,
    [`src/main/java/${pkg.replace(/\./g, '/')}/IndexController.java`]: `package ${pkg};
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class IndexController {
  @Value("${search.baseUrl}") private String baseUrl;
  @Value("${search.endpoints.index}") private String indexEp;

  @PostMapping("/index")
  public ResponseEntity<?> runIndex(@RequestParam String collection, @RequestParam String type) {
    RestTemplate rt = new RestTemplate();
    String url = baseUrl + indexEp + "?collection=" + collection + "&type=" + type;
    ResponseEntity<Map> res = rt.postForEntity(url, null, Map.class);
    return ResponseEntity.status(res.getStatusCode()).body(res.getBody());
  }
}`,
    [`src/main/java/${pkg.replace(/\./g, '/')}/WebController.java`]: `package ${pkg};
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {
  @GetMapping("/")
  public String index(Model model) {
    model.addAttribute("title", "Search Demo");
    return "index";
  }
}`,
    'src/main/resources/templates/index.html': `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Search Demo</title></head>
<body>
  <h1>Search Demo</h1>
  <form id="f">
    <textarea id="q" rows="8" cols="80">{ "querySet": { "version":"1.0", "query":[{"fromSet":{"collection":["${collection}"]},"selectSet":{"fields":["*"]},"whereSet":{"operator":"AND","searchKeyword":"테스트"}}] } }</textarea>
    <br/>
    <button type="submit">Search</button>
  </form>
  <pre id="out"></pre>
  <script>
  document.getElementById('f').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const body = JSON.parse(document.getElementById('q').value);
    const res = await fetch('/api/search', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    const json = await res.json();
    document.getElementById('out').textContent = JSON.stringify(json,null,2);
  });
  </script>
</body></html>`
  };
}

export const codegen = {
  'codegen.page.java.create': {
    handler: async (input) => {
      const schema = { type:'object', required:['artifactId','groupId','package','collection','endpoints'], properties:{
        artifactId:{type:'string'}, groupId:{type:'string'}, package:{type:'string'}, collection:{type:'string'},
        endpoints:{type:'object'}
      }};
      makeValidator(schema)(input);
      const files = springBootTemplate(input);
      // Return a simple in-memory "bundle"
      return ok('codegen.page.java.create', input, { files });
    }
  },
  'codegen.page.java.preview': {
    handler: async (input) => {
      return ok('codegen.page.java.preview', input, { note: 'use create to get file map' });
    }
  },
  'codegen.page.java.params': {
    handler: async () => {
      return ok('codegen.page.java.params', {}, {
        required: ['artifactId','groupId','package','collection','endpoints.search','endpoints.index']
      });
    }
  }
};
