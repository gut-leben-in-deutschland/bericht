let
  pkgs = import <nixpkgs> {};
  stdenv = pkgs.stdenv;
in rec {
  project = stdenv.mkDerivation rec {
    name = "quality-of-life";
    buildInputs = [
      pkgs.nodejs-8_x
      pkgs.yarn
      pkgs.gdal
    ];
  };
}
