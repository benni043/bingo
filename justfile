set windows-shell := ["powershell.exe", "-NoLogo", "-Command"]

build version:
    docker build -t bingo:{{version}} .

publish version: (build version)
    docker tag bingo:{{version}} ghcr.io/benni043/bingo:{{version}}
    docker push ghcr.io/benni043/bingo:{{version}}