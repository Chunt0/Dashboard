# TODO

UPDATE: This might not be a problem? I tested it again without changing anything and it seems to work fine? I'm a bit confused, this needs more tesitng
- [ ] Fix dataset cache creation in Diffusion Pipe
  - Currently, it uses local paths that are inaccessible within the Docker image.
  - Find a solution to make the dataset cache accessible inside the Docker environment.
  - Potential approaches:
    - Use Docker volumes to share cache directories
    - Configure Diffusion Pipe to use relative or environment-variable-based paths
    - Adjust caching logic to be Docker-compatible

- [ ] Figure out an efficient way to give the user feedback about what is in the queue, and what the current status of the trianer is. Also alert the user of any errors.

- [ ] Continue building out the generation tab. Figure out how to handle websocket connection in order to give the client the generated image 
