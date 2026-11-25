FROM alpine:3.22 AS download
RUN apk add --no-cache curl && curl --fail --location --silent --show-error \
    https://repo.maven.apache.org/maven2/io/phasetwo/keycloak/keycloak-magic-link/0.94/keycloak-magic-link-0.94.jar \
    --output /tmp/email-otp.jar && \
    echo 'e9e7c3df0c0b36fd72ed5dfbcd305d281b4a18ffd88cdff7685103194e9072e1  /tmp/email-otp.jar' | sha256sum -c -
FROM quay.io/keycloak/keycloak:26.8.0
COPY --from=download /tmp/email-otp.jar /opt/keycloak/providers/email-otp.jar
