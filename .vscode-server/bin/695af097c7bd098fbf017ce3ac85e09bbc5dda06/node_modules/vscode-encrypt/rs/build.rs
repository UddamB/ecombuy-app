fn main() {
    let mut cxx = cxx_build::bridge("src/lib.rs");

    let base_dir = std::env::var("CARGO_MANIFEST_DIR").expect("expected manifest dir");
    let out_dir = std::env::var("OUT_DIR").expect("expected out dir");
    let enc_sources = format!("{}/../src", base_dir);

    cxx.file(format!("{}/base64.cc", enc_sources));

    match std::env::var("CARGO_CFG_TARGET_OS")
        .expect("expected target os")
        .as_str()
    {
        "linux" => {
            include_openssl(&mut cxx);
            cxx.file(format!("{}/encrypt_posix.cc", enc_sources))
               .define("OS_LINUX", None);
        }
        "macos" => {
            include_openssl(&mut cxx);
            cxx.file(format!("{}/encrypt_posix.cc", enc_sources))
               .define("OS_MACOS", None);
        }
        "windows" => {
            cxx.flag("/guard:cf");
            println!("cargo:rustc-link-lib=shell32");
            cxx.file(format!("{}/encrypt_win.cc", enc_sources));
        }
        os => panic!("unsupported target os {}", os),
    };

    cxx.file("src/lib.cc")
        .include(enc_sources)
        .include(out_dir)
        .include(base_dir)
        .flag_if_supported("-std=c++14")
        .compile("vscode-encrypt");
}

fn include_openssl(cxx: &mut cc::Build) {
    let openssl_includes = std::env::var("DEP_OPENSSL_INCLUDE").expect("expected openssl includes");
    cxx.include(openssl_includes);

    if std::env::var("DEP_OPENSSL_VENDORED").is_ok() {
        println!("cargo:rustc-link-lib=static={}", "ssl");
        println!("cargo:rustc-link-lib=static={}", "crypto");
    }
}
