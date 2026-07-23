package samples.comparison.spring.greeting;

public class TimeFormatter {
    private final String prefix;

    public TimeFormatter(String prefix) {
        this.prefix = prefix;
    }

    public String format(String value) {
        return prefix + " " + value;
    }
}
