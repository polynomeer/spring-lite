package lite.spring.example.lab.whatif;

import lite.spring.web.annotation.PathVariable;
import lite.spring.web.annotation.PostMapping;
import lite.spring.web.annotation.RequestMapping;
import lite.spring.web.annotation.RestController;

@RestController
@RequestMapping("/lab/what-if")
public class WhatIfController {
    private final WhatIfService whatIfService;

    public WhatIfController(WhatIfService whatIfService) {
        this.whatIfService = whatIfService;
    }

    @PostMapping("/{id}/{mode}")
    public WhatIfRunResponse run(@PathVariable("id") String id, @PathVariable("mode") String mode) {
        return whatIfService.run(id, mode);
    }
}
