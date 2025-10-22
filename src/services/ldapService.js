import ldap from "ldapjs";

export async function connectToLdap(username, password) {
  const ldapUrl = "ldap://10.10.117.250";
  const client = ldap.createClient({ url: ldapUrl });

  const ldapUser = `Korektel\\${username}`; // same as 'Korektel' . "\\" . $username

  // A cleaner way to structure the bind operation
  return new Promise((resolve, reject) => {
    // Use reject for errors
    client.bind(ldapUser, password, (err) => {
      // Always ensure the client is unbound/closed after the operation is complete
      client.unbind((unbindErr) => {
        if (unbindErr) {
          console.error("Unbind failed:", unbindErr.message);
          // We still proceed based on the bind result
        }

        if (err) {
          console.error("LDAP bind failed:", err.message);
          // Do NOT reject, as the calling function expects 'false' for auth failure
          return resolve(false);
        } else {
          console.log("LDAP bind successful!");
          return resolve(true);
        }
      });
    });
  });
}
