package lite.spring.example.lab;

import lite.spring.context.ApplicationContext;
import lite.spring.web.annotation.GetMapping;
import lite.spring.web.annotation.RequestMapping;
import lite.spring.web.annotation.RestController;

@RestController
@RequestMapping("/lab/container")
public class ContainerGraphController {
    private final ApplicationContext applicationContext;

    public ContainerGraphController(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    /** Read-only: describes the beans that already exist without creating any. */
    @GetMapping("/graph")
    public ContainerGraphResponse graph() {
        return new ContainerGraphResponse(
            applicationContext.getBeanRuntimeDescriptors().stream().map(ContainerBeanView::from).toList(),
            applicationContext.getRefreshTrace().stream().map(LabTraceEventView::from).toList()
        );
    }
}
