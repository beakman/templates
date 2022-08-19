import { createTemplate, randomPassword, Services } from "~templates-utils";

export default createTemplate({
  name: "Mattermost",
  meta: {
    description:
      "Open source platform for developer collaboration. Secure, flexible, and integrated with the tools you love.",
    changeLog: [{ date: "2022-07-12", description: "first release" }],
    links: [
      { label: "Website", url: "https://mattermost.com/" },
      { label: "Github", url: "https://github.com/mattermost/" },
    ],
    contributors: [
      { name: "Bedeoan Raul", url: "https://github.com/bedeoan" },
      { name: "Andrei Canta", url: "https://github.com/deiucanta" },
    ],
  },
  schema: {
    type: "object",
    required: ["projectName", "domain", "appServiceName", "dbServiceName"],
    properties: {
      projectName: {
        type: "string",
        title: "Project Name",
      },
      domain: {
        type: "string",
        title: "Domain",
      },
      appServiceName: {
        type: "string",
        title: "Service Name",
        default: "mattermost",
      },
      dbServiceName: {
        type: "string",
        title: "Postgres Database Name",
        default: "mattermost-db",
      },
    },
  } as const,
  generate({ projectName, domain, appServiceName, dbServiceName }) {
    const services: Services = [];
    const databasePassword = randomPassword();

    services.push({
      type: "postgres",
      data: {
        projectName,
        serviceName: dbServiceName,
        password: databasePassword,
      },
    });

    services.push({
      type: "app",
      data: {
        projectName,
        serviceName: appServiceName,
        source: {
          type: "image",
          image: "mattermost/mattermost-team-edition:7.1",
        },
        mounts: [
          { type: "volume", name: "mattermost", mountPath: "/mattermost" },
        ],
        domains: [{ name: domain }],
        proxy: { port: 8065, secure: true },
        deploy: { replicas: 1, command: null, zeroDowntime: true },
        env: [
          `MM_SQLSETTINGS_DRIVERNAME=postgres`,
          `MM_SQLSETTINGS_DATASOURCE=postgres://postgres:${databasePassword}@${projectName}_${dbServiceName}:5432/${projectName}?sslmode=disable`,
        ].join("\n"),
      },
    });

    return { services };
  },
});