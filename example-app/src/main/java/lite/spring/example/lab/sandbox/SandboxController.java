package lite.spring.example.lab.sandbox;

import java.util.Map;
import lite.spring.web.annotation.PostMapping;
import lite.spring.web.annotation.RequestBody;
import lite.spring.web.annotation.RequestMapping;
import lite.spring.web.annotation.RestController;

@RestController
@RequestMapping("/lab/sandbox")
public class SandboxController {
    private final SandboxService sandboxService;

    public SandboxController(SandboxService sandboxService) {
        this.sandboxService = sandboxService;
    }

    @PostMapping("/run")
    public SandboxRunResponse run(@RequestBody Map<String, Object> body) {
        return sandboxService.run(body);
    }
}
