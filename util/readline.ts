import { BufReader } from "https://deno.land/std@0.74.0/io/mod.ts";
import { TextProtoReader } from "https://deno.land/std@0.74.0/textproto/mod.ts";

/** Iterates through a file line by line.
 * @param filename File to read
 */

export async function* readLine(filename:string): AsyncGenerator<string> {
  const r : Deno.FsFile = await Deno.open(filename)
  const reader = new TextProtoReader(BufReader.create(r))

  while (true) {
    const line = await reader.readLine()
    if (line === null) {
      r.close()
      break
    }
    yield line
  }
}
