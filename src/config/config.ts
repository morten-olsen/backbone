class Config {
  public get jwtSecret() {
    return process.env.JWT_SECRET;
  }

  public get adminToken() {
    return process.env.ADMIN_TOKEN;
  }

  public get oidc() {
    const enabled = process.env.OIDC_ENABLED === 'true';
    const discoveryUrl = process.env.OIDC_DISCOVERY_URL;
    const clientId = process.env.OIDC_CLIENT_ID;
    const clientSecret = process.env.OIDC_CLIENT_SECRET;
    const groupField = process.env.OIDC_GROUP_FIELD || 'groups';
    const adminGroup = process.env.OIDC_ADMIN_GROUP;
    const writerGroup = process.env.OIDC_WRITER_GROUP;
    const readerGroup = process.env.OIDC_READER_GROUP;
    return {
      enabled,
      discoveryUrl,
      clientId,
      clientSecret,
      groupField,
      groups: {
        admin: adminGroup,
        writer: writerGroup,
        reader: readerGroup,
      },
    };
  }

  public get k8s() {
    const enabled = process.env.K8S_ENABLED === 'true';
    return {
      enabled,
    };
  }

  public get http() {
    const port = process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT) : 8883;
    return {
      port,
    };
  }

  public get api() {
    const enabled = process.env.API_ENABLED === 'true';
    return {
      enabled,
    };
  }

  public get ws() {
    const enabled = process.env.WS_ENABLED === 'true';
    return {
      enabled,
    };
  }

  public get tcp() {
    const enabled = (process.env.TCP_ENABLED = 'true');
    const port = process.env.TCP_PORT ? parseInt(process.env.TCP_PORT) : 1883;
    return {
      enabled,
      port,
    };
  }
}

export { Config };
