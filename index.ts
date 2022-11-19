import { exec } from "child_process";
import proxy from "node-tcp-proxy";

let awaiting_rest = false;
let partial_data: Buffer[] = [];
let expected_len = 0;

exec("cat /etc/resolv.conf | grep nameserver | cut -d' ' -f2", (error: any, stdout: any, stderr: any) => {
  if (error) {
    console.log(`error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`stderr: ${stderr}`);
    return;
  }

  const wsl_host_ip = stdout;

  proxy.createProxy(6008, wsl_host_ip, 6008,
    {
      downstream: function(context, data) {

        if (awaiting_rest) {
          partial_data.push(data);
          let bytes = 0;
          partial_data.forEach(buf => bytes += buf.byteLength);
          if (bytes < expected_len) {
            return Buffer.from('', "utf-8");
          }
          awaiting_rest = false;
          data = Buffer.concat(partial_data);
        }
        const str = data.toString('utf-8');
        console.log(str);
        const lines = str.split('\r\n');

        const headers: string[] = [];
        const body: string[] = [];
        let done_with_headers = false;
        lines.forEach(line => {
          if (!line) {
            done_with_headers = true;
            return;
          }
          if (done_with_headers) body.push(line);
          else headers.push(line);
        });

        const body_len = body.join("").length

        if (!awaiting_rest) {
          for (let i = 0; i < headers.length; ++i) {
            const [name, value] = headers[i].split(": ");
            if (name !== "Content-Length") continue;
            expected_len = Number.parseInt(value);
          }
          if (expected_len > body_len) {
            console.error("EXPECTED MORE", expected_len, body_len);
            awaiting_rest = true;
            partial_data = [data];
            return Buffer.from('', "utf-8");
          }
        }
        const new_body = body.join("").replace(/C:\//g, "/mnt/c/")

        for (let i = 0; i < headers.length; ++i) {
          const [name] = headers[i].split(": ");
          if (name !== "Content-Length") continue;
          headers[i] = "Content-Length: " + new_body.length.toString()
        }

        headers.push('');
        headers.push(new_body);

        const new_data = headers.join('\r\n');


        return Buffer.from(new_data, "utf-8");
      },
    });

});
