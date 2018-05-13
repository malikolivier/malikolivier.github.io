---
layout: post
title: "Experimenting on rusty-machine"
language: en
keywords: rust ml
---


I tried to experiment on the [rusty-machine](https://github.com/AtheMathmo/rusty-machine) crate,
to see the current state of the art in machine learning in Rust.

I decided to try some OCR, to break a very simple captcha system.

{% include figure.html
    url='/images/ml/CVEN.png'
    alt='Captcha showing CVEN'
    width='200px'
    caption='Example of the captchas to break'
%}

The first thing I realized was that I needed to re-implement all myself.
No fancy OpenCV. There is a [crate](https://github.com/kali/opencv-rust) available, but I gave up trying to compile it
as it required an older version of OpenCV at the time of writing.
Anyway, I only needed one not-super-trivial algorithm
(blob recognition to identify letters)
and I could re-implement it from scratch in Rust.

So I took a sample of a few thousands images like the one in the figure above as learning fodder.
Walking through a directory can be done painlessly with the [walkdir](https://github.com/BurntSushi/walkdir) crate.
Images an be loaded as grayscale very easily using the [image](https://github.com/PistonDevelopers/image) crate provided by the Piston developers.

Writing the algo to identifying the blobs for each character was done quickly enough.
I was able to extract each of the letters separately, then resize them all so that they are the same size.

That's when I tried to feed my letters into the learning algorithms provided by *rusty-machine*.
That was, erh,... painful.

I started by implementing my own splitting function.
I came up with a lot of difficulties that are unexpected for someone used to
crunch numbers with numpy.

First the `train` method on the [SupModel](https://athemathmo.github.io/rusty-machine/doc/rusty_machine/learning/trait.SupModel.html) trait is only implemented with `Matrix<f64>` or `Vector<f64>`.
which forces us to send in references to the matrices as below:
```rust
// Load image data from disk for trainng
let (inputs, targets) = load_data();
// Feed training data
model.train(&inputs, &targets).unwrap();
```

It would have been much more convenience if [MatrixSlice](https://athemathmo.github.io/rusty-machine/doc/rusty_machine/linalg/struct.MatrixSlice.html) could be usable instead.
Maybe having `train` taking a reference to an object implementing the `MatrixBase` trait
might be a solution. Another possible solution might be to implement `AsRef<MatrixSlice<T>>` for `Matrix<T>`.

As slices were not usable, I had to clone my data when splitting traing and test
datasets, to create a `Matrix<T>`.

```rust
// Split training and testing datasets

extern crate rusty_machine as rm;
use rm::linalg::{BaseMatrix, Matrix};

fn main() {
    let (inputs, targets) = load_data();
    let (x_train, x_test, y_train, y_test) = split_train_test(inputs, targets, 0.8);
    // ...
}

fn split_train_test<T: Copy>(
    inputs: Matrix<T>,
    outputs: Matrix<T>,
    ratio: f64,
) -> (Matrix<T>, Matrix<T>, Matrix<T>, Matrix<T>) {
    let rows = inputs.rows();
    let split = (ratio * rows as f64) as usize;
    // The select_rows method expects an iterator of references to usize...
    // This may not seem much, but this requires to keep the instances to `usize` alive
    // That's what we do in the following hack:
    let split_until = (0..split).collect::<Vec<_>>();
    let split_from = (split..rows).collect::<Vec<_>>();
    // select_rows copies the underlying data
    (
        inputs.select_rows(split_until.iter()),
        inputs.select_rows(split_from.iter()),
        outputs.select_rows(split_until.iter()),
        outputs.select_rows(split_from.iter()),
    )
}
```

In a perfect world, while implementing `split_train_test`, I would have rejoiced
to be able to do so as below:

```rust
fn split_train_test<T: Copy>(
    inputs: Matrix<T>,
    outputs: Matrix<T>,
    ratio: f64,
) -> (Matrix<T>, Matrix<T>, Matrix<T>, Matrix<T>) {
    let rows = inputs.rows();
    let split = (ratio * rows as f64) as usize;
    // **WARNING**: DOES NOT COMPILE!
    (
        inputs.select_rows(..split),
        inputs.select_rows(split..),
        outputs.select_rows(..split),
        outputs.select_rows(split..),
    )
}
```

Moreoever, it appears that there is no current way to serialize the models
for future re-use.
Pythonistas are used to [pickle](https://docs.python.org/3.6/library/pickle.html)ing a model and save it to the file system,
in order to avoid the cost of re-running the costly learning procedure.


To conclude, it was fun to wade my way through *rusty-machine*.
However, it appears that rust still lacks the appropriate tooling to conveniently write scientific code
(no real gain in speed). I cannot wait to see what will happen in 2019 though.


*Disclaimer*: This post is only constructive criticism. The folks at *rusty-machine*
are doing great work!
