package lite.spring.web.json;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class JsonMapperTest {
    private final JsonMapper jsonMapper = new JsonMapper();

    @Test
    void serializesPrimitiveCollectionRecordAndPojoValues() {
        assertThat(jsonMapper.write("hello\"world")).isEqualTo("\"hello\\\"world\"");
        assertThat(jsonMapper.write(List.of("a", 1, true))).isEqualTo("[\"a\",1,true]");
        assertThat(jsonMapper.write(Map.of("name", "spring"))).contains("\"name\":\"spring\"");
        assertThat(jsonMapper.write(new SampleRecord("codex", 2))).isEqualTo("{\"name\":\"codex\",\"count\":2}");
        assertThat(jsonMapper.write(new SamplePojo("lite", false))).isEqualTo("{\"name\":\"lite\",\"enabled\":false}");
    }

    @Test
    void escapesControlCharactersSoOutputStaysValidJson() {
        String written = jsonMapper.write("line1\nline2\t\"q\"\\\u0001");

        assertThat(written).isEqualTo("\"line1\\nline2\\t\\\"q\\\"\\\\\\u0001\"");
        assertThat(jsonMapper.readTree(written)).isEqualTo("line1\nline2\t\"q\"\\\u0001");
    }

    @Test
    void parsesNestedJsonStructures() {
        Object parsed = jsonMapper.readTree("{\"name\":\"codex\",\"count\":3,\"enabled\":true,\"items\":[1,2],\"nested\":{\"value\":null}}");

        Map<String, Object> expected = new LinkedHashMap<>();
        expected.put("name", "codex");
        expected.put("count", 3.0);
        expected.put("enabled", true);
        expected.put("items", List.of(1.0, 2.0));
        expected.put("nested", java.util.Collections.singletonMap("value", null));

        assertThat(parsed).isEqualTo(expected);
    }

    @Test
    void rejectsMalformedJsonTokens() {
        assertThatThrownBy(() -> jsonMapper.readTree("{\"flag\":truthy}"))
            .isInstanceOf(RuntimeException.class);
    }

    record SampleRecord(String name, int count) {
    }

    static class SamplePojo {
        private final String name;
        private final boolean enabled;

        SamplePojo(String name, boolean enabled) {
            this.name = name;
            this.enabled = enabled;
        }
    }
}
