package com.example.soundtracker.api;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController implements ErrorController {

    /** Vangt alle frontend-routes op (enkelvoudig pad, bijv. /login) */
    @GetMapping(value = { "/", "/{path:[^\\.]*}" })
    public String forward() {
        return "forward:/index.html";
    }

    /**
     * Vangt alle overige paden op die Spring Boot niet kent
     * (bijv. /admin/review, /me/stats) — geeft index.html terug
     * zodat React Router het client-side afhandelt.
     */
    @RequestMapping("/error")
    public String handleError() {
        return "forward:/index.html";
    }
}
