package lite.spring.example.lab.pitfall;

import lite.spring.web.annotation.PathVariable;
import lite.spring.web.annotation.PostMapping;
import lite.spring.web.annotation.RequestMapping;
import lite.spring.web.annotation.RestController;

@RestController
@RequestMapping("/lab/pitfalls")
public class PitfallController {
    private final PitfallService pitfallService;

    public PitfallController(PitfallService pitfallService) {
        this.pitfallService = pitfallService;
    }

    @PostMapping("/{id}/{variant}")
    public PitfallRunResponse run(@PathVariable("id") String id, @PathVariable("variant") String variant) {
        return pitfallService.run(id, variant);
    }
}
