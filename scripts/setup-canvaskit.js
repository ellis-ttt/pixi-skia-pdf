import { execSync } from "child_process"
import { existsSync, readFileSync, mkdirSync, cpSync } from "fs"

const DEST = "public/canvaskit"
const SHA_FILE = `${DEST}/.build-sha`
const OUT = "skia/out/canvaskit_wasm"

let sha = execSync("git -C skia rev-parse HEAD", { encoding: "utf8" }).trim()

if (existsSync(SHA_FILE) && readFileSync(SHA_FILE, "utf8").trim() === sha) {
	process.exit(0)
}

let isWindows = process.platform === "win32"

if (isWindows) {
	execSync(
		`wsl bash -c "
      export PATH=\\$PWD/depot_tools:\\$PATH &&
      cd skia &&
      python3 tools/git-sync-deps &&
      bin/activate-emsdk &&
      . third_party/externals/emsdk/emsdk_env.sh &&
      cd modules/canvaskit &&
      bash compile.sh no_skottie=true no_particles=true no_sksl_trace=true release
    "`,
		{ stdio: "inherit", shell: "cmd.exe" },
	)
} else {
	if (!existsSync("depot_tools")) {
		execSync(
			"git clone --depth 1 https://chromium.googlesource.com/chromium/tools/depot_tools.git depot_tools",
			{ stdio: "inherit" },
		)
	}

	execSync(
		`sh -c "
      export PATH=\\$PWD/depot_tools:\\$PATH &&
      cd skia &&
      python3 tools/git-sync-deps &&
      bin/activate-emsdk &&
      . third_party/externals/emsdk/emsdk_env.sh &&
      cd modules/canvaskit &&
      bash compile.sh no_skottie=true no_particles=true no_sksl_trace=true release
    "`,
		{ stdio: "inherit" },
	)
}

mkdirSync(DEST, { recursive: true })
cpSync(`${OUT}/canvaskit.js`, `${DEST}/canvaskit.js`)
cpSync(`${OUT}/canvaskit.wasm`, `${DEST}/canvaskit.wasm`)

import { writeFileSync } from "fs"
writeFileSync(SHA_FILE, sha)
