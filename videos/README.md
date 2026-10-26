# Videos Directory

Each video in this folder is an independent, self-contained HyperFrames project.

## Directory Structure

```text
videos/<video-name>/
├── script.md              # Scenario / script / storyboard / voiceover text
├── index.html             # Main composition root timeline
├── src/                   # HyperFrames source code (sub-compositions, components, CSS/JS)
│   ├── components/
│   └── styles.css
├── assets/                # Media assets for this video
│   ├── audio/             # Voiceover, music (BGM), sound effects (SFX)
│   ├── images/            # Graphics, pictures, illustrations
│   └── fonts/
└── output/                # Renders and review artifacts
    ├── <video-name>.mp4   # Final rendered video
    └── snapshots/         # Inspection frames
```

## Rules
1. **Naming:** Short, descriptive kebab-case (e.g., `ugaday-zhivotnoe`).
2. **Isolation:** Never mix assets or files across different video projects. Never overwrite previous projects.
3. **Verification:** Always run checks before completion:
   ```bash
   HYPERFRAMES_BROWSER_PATH=/usr/bin/google-chrome-stable npx hyperframes check videos/<video-name>
   ```
4. **Render:** Always output the final MP4 to `output/<video-name>.mp4`:
   ```bash
   HYPERFRAMES_BROWSER_PATH=/usr/bin/google-chrome-stable npx hyperframes render videos/<video-name> -o videos/<video-name>/output/<video-name>.mp4
   ```
