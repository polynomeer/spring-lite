package samples.comparison.di.springlite;

public class TimeFormatter {
    private final String prefix;

    public TimeFormatter(String prefix) {
        this.prefix = prefix;
    }

    public String format(String value) {
        return prefix + " " + value;
    }
}
