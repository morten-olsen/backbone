class Config {
  public get tokenSecret() {
    return process.env.TOKEN_SECRET;
  }

  public get k8s() {
    const enabled = process.env.K8S_ENABLED === 'true';
    return {
      enabled,
    };
  }

  public get http() {
    const enabled = (process.env.HTTP_ENABLED = 'true');
    const port = process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT) : 8883;
    return {
      enabled,
      port,
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
