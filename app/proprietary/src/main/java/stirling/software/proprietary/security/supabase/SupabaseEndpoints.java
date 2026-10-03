package stirling.software.proprietary.security.supabase;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Optional SaaS Supabase endpoints. Defaults are blank so PDF Control does not contact Stirling
 * cloud unless explicitly configured via {@code stirling.supabase.url} / {@code
 * stirling.supabase.publishable-key}.
 */
@Component
public class SupabaseEndpoints {

    public static final String DEFAULT_URL = "";

    /** Publishable (anon) key — safe to ship in client/server code. */
    public static final String DEFAULT_PUBLISHABLE_KEY = "";

    @Value("${stirling.supabase.url:" + DEFAULT_URL + "}")
    private String url;

    @Value("${stirling.supabase.publishable-key:" + DEFAULT_PUBLISHABLE_KEY + "}")
    private String publishableKey;

    public String getUrl() {
        return url;
    }

    public String getPublishableKey() {
        return publishableKey;
    }

    /** JWT issuer claim used to validate tokens minted by this project. */
    public String getIssuer() {
        return url + "/auth/v1";
    }

    /** JWKS URL for {@code NimbusJwtDecoder.withJwkSetUri(...)}. */
    public String getJwksUrl() {
        return getIssuer() + "/.well-known/jwks.json";
    }
}
