// import ldap from "ldapjs";

// export async function connectToLdap(username, password) {
//   const ldapUrl = "ldap://10.10.117.250";
//   const client = ldap.createClient({ url: ldapUrl });

//   const ldapUser = `Korektel\\${username}`; // same as 'Korektel' . "\\" . $username

//   return new Promise((resolve) => {
//     client.bind(ldapUser, password, (err) => {
//       if (err) {
//         console.error("LDAP bind failed:", err.message);
//         client.unbind();
//         return resolve(false);
//       } else {
//         console.log("LDAP bind successful!");
//         client.unbind();
//         return resolve(true);
//       }
//     });
//   });
// }
