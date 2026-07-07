package lite.spring.boot.support.autoconfigure;

import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.ConditionalOnMissingBean;
import lite.spring.core.annotation.Configuration;
import lite.spring.web.json.JsonMapper;

@Configuration
public class JsonAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean(JsonMapper.class)
    JsonMapper jsonMapper() {
        return new JsonMapper();
    }
}
