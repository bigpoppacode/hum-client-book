module.exports = {
  apps: [
    {
      name: "hum-client-book",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
