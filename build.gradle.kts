import org.gradle.api.plugins.JavaPluginExtension

plugins {
    base
}

val junitVersion = "5.10.2"
val assertjVersion = "3.26.3"
val h2Version = "2.2.224"

allprojects {
    group = "lite.spring"
    version = "0.1.0-SNAPSHOT"

    repositories {
        mavenCentral()
    }
}

subprojects {
    apply(plugin = "java-library")

    extensions.configure<JavaPluginExtension> {
        toolchain {
            languageVersion.set(JavaLanguageVersion.of(21))
        }
        withSourcesJar()
        withJavadocJar()
    }

    tasks.withType<Test>().configureEach {
        useJUnitPlatform()
    }

    dependencies {
        "testImplementation"("org.junit.jupiter:junit-jupiter-api:$junitVersion")
        "testRuntimeOnly"("org.junit.jupiter:junit-jupiter-engine:$junitVersion")
        "testImplementation"("org.assertj:assertj-core:$assertjVersion")
    }
}

project(":spring-lite-core") {
    description = "Foundational utilities, metadata, and reflection helpers."
}

project(":spring-lite-context") {
    description = "IoC container, bean lifecycle, configuration model, and scanning."
    dependencies {
        "api"(project(":spring-lite-core"))
    }
}

project(":spring-lite-aop") {
    description = "Proxy infrastructure, advisors, and method interception."
    dependencies {
        "api"(project(":spring-lite-context"))
    }
}

project(":spring-lite-web") {
    description = "MVC dispatcher, request mapping, argument resolution, and HTTP abstractions."
    dependencies {
        "api"(project(":spring-lite-context"))
    }
}

project(":spring-lite-jdbc") {
    description = "JDBC support, connection utilities, and template APIs."
    dependencies {
        "api"(project(":spring-lite-context"))
        "implementation"(project(":spring-lite-tx"))
        "testImplementation"("com.h2database:h2:$h2Version")
    }
}

project(":spring-lite-tx") {
    description = "Transaction boundary management and transactional interception."
    dependencies {
        "api"(project(":spring-lite-aop"))
    }
}

project(":spring-lite-boot") {
    description = "Application bootstrap, auto configuration, and embedded runtime integration."
    dependencies {
        "api"(project(":spring-lite-web"))
        "api"(project(":spring-lite-jdbc"))
        "api"(project(":spring-lite-tx"))
    }
}

project(":spring-lite-test") {
    description = "Test support for context loading, MVC tests, and integration fixtures."
    dependencies {
        "api"(project(":spring-lite-boot"))
    }
}

project(":example-app") {
    apply(plugin = "application")

    dependencies {
        "implementation"(project(":spring-lite-boot"))
        "testImplementation"(project(":spring-lite-test"))
    }

    extensions.configure<org.gradle.api.plugins.JavaApplication> {
        mainClass.set("lite.spring.example.ExampleApplication")
    }
}
