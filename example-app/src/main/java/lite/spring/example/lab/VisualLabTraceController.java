package lite.spring.example.lab;

import lite.spring.web.annotation.PostMapping;
import lite.spring.web.annotation.RequestBody;
import lite.spring.web.annotation.RequestMapping;
import lite.spring.web.annotation.RestController;

@RestController
@RequestMapping("/lab/run")
public class VisualLabTraceController {
    private final VisualLabTraceService visualLabTraceService;

    public VisualLabTraceController(VisualLabTraceService visualLabTraceService) {
        this.visualLabTraceService = visualLabTraceService;
    }

    @PostMapping("/trace")
    public LabTraceResponse trace(@RequestBody LabTraceRequest request) {
        return visualLabTraceService.run(request);
    }
}
