# TODO

- [ ] Fix dataset cache creation in Diffusion Pipe
  - Currently, it uses local paths that are inaccessible within the Docker image.
  - Find a solution to make the dataset cache accessible inside the Docker environment.
  - Potential approaches:
    - Use Docker volumes to share cache directories
    - Configure Diffusion Pipe to use relative or environment-variable-based paths
    - Adjust caching logic to be Docker-compatible
