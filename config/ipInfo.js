module.exports = {
  // Google won't allow us to use an IP, it must be a domain name.
  // The only non-.com domain name allowed is localhost
  // Because we are developing on a VM, we created a separate domain,
  // vm.com, on the Mac. To use this, we must define it in our environment.
  // Default we will leave as localhost, because that is how our cloud instances will run
  localDomain: process.env.LOCAL_DOMAIN || 'localhost',

  // AWS Elastic Beanstalk routes all traffic on port 80 to
  // an internal port (presumably port 8081). This internal port,
  // the one we listen on, is defined in the ENV var PORT
  localPort: process.env.PORT || 5000,
};
