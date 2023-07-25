#pragma once
#include "encrypt.h"
#include "rust/cxx.h"

rust::String encrypt(rust::Slice<const uint8_t> key,
                     rust::Slice<const uint8_t> value);
rust::Vec<uint8_t> decrypt(rust::Slice<const uint8_t> key, rust::Str value);
