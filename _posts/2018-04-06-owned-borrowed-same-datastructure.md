---
layout: post
title: "References and lifetimes with owned data: Using owned and borrowed values in the same datastructure"
language: en
keywords: programming rust lifetimes bow cow
---

I hit a problem similar to what we the one below during my early days with rust:

Here are the requirements (this is just one far-fetched example):

1. I want to store all the `Asteroid`s in `Space`.
2. The `Asteroid` list is pre-defined and owned somewhere else, so we can just
keep a reference to the asteroids.
3. While the program is running, new `Asteroid`s may be spontaneously created
inside `Space`.

Sounds simple, let's give it a try.

```rust
struct Asteroid {
    name: &'static str,
    // More stuff related to the asteroid.
}

struct Space<'a> {
    /// Keep a reference to asteroids.
    asteroids: Vec<&'a Asteroid>,
}

impl<'a> Space<'a> {
    fn new(asteroids: Vec<&'a Asteroid>) -> Self {
        Self { asteroids }
    }
}

fn main() {
    let asteroid_ceres = Asteroid { name: "Ceres" };
    let asteroid_trojan = Asteroid { name: "Trojan" };
    let space = Space::new(vec![&asteroid_ceres, &asteroid_trojan]);
    // Do something with space
}
```

Fair enough, requirements `1.` and `2.` are implemented. Let's implement `3.`.
We'll add a method `create_asteroid` to `Space` with a naive (wrong) approach.

```rust
impl<'a> Space<'a> {
    // ...
    fn create_asteroid(&mut self) {
        let new_asteroid = Asteroid { name: "NEW" };
        self.asteroids.push(&self.new_asteroid);
    }
}
```

Of course this does not compile! `new_asteroid` will be dropped at the end of
the `create_asteroid` function. The pointer inside `self.asteroids` would be
a dangling pointer and `rustc` will scream at you!

```r
error[E0597]: `new_asteroid` does not live long enough
  --> src/main.rs:17:30
   |
17 |         self.asteroids.push(&new_asteroid);
   |                              ^^^^^^^^^^^^ borrowed value does not live long enough
18 |     }
   |     - borrowed value only lives until here
```

Ok, so you see the rationale? The value of `new_asteroid` must be owned
somewhere! A little less naive (but still wrong) approach would be to have the
new `Space` object own `new_asteroid`! Let's do it.


## Solution 0: Own the `Asteroid` somewhere in `Space`

```rust
struct Space<'a> {
   asteroids: Vec<&'a Asteroid>,
   /// NEW! Own the new asteroids.
   new_asteroids: Vec<Asteroid>,
}

impl<'a> Space<'a> {
    fn new(asteroids: Vec<&'a Asteroid>) -> Self {
        Self { asteroids, new_asteroids: vec![] }
    }

    fn create_asteroid(&mut self) {
        let new_asteroid = Asteroid { name: "NEW" };
        self.new_asteroids.push(new_asteroid);
    }
}
```

This will compile. However, some people might say "I want all the asteroids to
be included in the same object!" (for whatever reason, i.e. better integration
with lots of legacy code, ouch).

Can you execute the code as below?

```rust
impl<'a> Space<'a> {
    // ...
    fn create_asteroid(&mut self) {
        let new_asteroid = Asteroid { name: "NEW" };
        self.new_asteroids.push(new_asteroid);
        self.asteroids.push(self.new_asteroids.last().unwrap());
    }
}
```

Let's see. NO.

```r
error[E0495]: cannot infer an appropriate lifetime for lifetime parameter in function call due to conflicting requirements
  --> src/main.rs:18:48
   |
18 |         self.asteroids.push(self.new_asteroids.last().unwrap());
   |                                                ^^^^
   |
note: first, the lifetime cannot outlive the anonymous lifetime #1 defined on the method body at 15:5...
  --> src/main.rs:15:5
   |
15 | /     fn create_asteroid(&mut self) {
16 | |         let new_asteroid = Asteroid { name: "NEW" };
17 | |         self.new_asteroids.push(new_asteroid);
18 | |         self.asteroids.push(self.new_asteroids.last().unwrap());
19 | |     }
   | |_____^
note: ...so that reference does not outlive borrowed content
  --> src/main.rs:18:29
   |
18 |         self.asteroids.push(self.new_asteroids.last().unwrap());
   |                             ^^^^^^^^^^^^^^^^^^
note: but, the lifetime must be valid for the lifetime 'a as defined on the impl at 10:1...
  --> src/main.rs:10:1
   |
10 | impl<'a> Space<'a> {
   | ^^^^^^^^^^^^^^^^^^
note: ...so that reference does not outlive borrowed content
  --> src/main.rs:18:29
   |
18 |         self.asteroids.push(self.new_asteroids.last().unwrap());
   |                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

Well you see, the lifetimes of the references inside `self.asteroids` are all `'a`,
right? The lifetimes of the whole `Space` struct (and of its owned values:
`self.new_asteroids`) are not the same! You could force their lifetimes to be
identical by defining `create_asteroid` as follows:

```rust
impl<'a> Space<'a> {
    // ...
    fn create_asteroid(&'a mut self) {
        let new_asteroid = Asteroid { name: "NEW" };
        self.new_asteroids.push(new_asteroid);
        self.asteroids.push(self.new_asteroids.last().unwrap());
    }
}
```

This will compile. Now, using `create_asteroid` twice will not compile:

```rust
fn main() {
    let asteroid_ceres = Asteroid { name: "Ceres" };
    let asteroid_trojan = Asteroid { name: "Trojan" };
    let mut space = Space::new(vec![&asteroid_ceres, &asteroid_trojan]);
    space.create_asteroid();
    space.create_asteroid();
}
```

See for yourself:

```r
error[E0499]: cannot borrow `space` as mutable more than once at a time
  --> src/main.rs:27:5
   |
26 |     space.create_asteroid();
   |     ----- first mutable borrow occurs here
27 |     space.create_asteroid();
   |     ^^^^^ second mutable borrow occurs here
28 | }
   | - first borrow ends here
```

Why? `create_asteroid` borrows `space` mutably for its whole lifetime (`'a`)!
So the borrow only ends when `space` is dropped. Just as `rustc` tells you.

(*) This actually protect you from doing a lot of ugly stuff, which include for
example removing an `Asteroid` from the `new_asteroids` vector. If you were to
be able to do that, `asteroids` would then contain dangling references.

## Solution 1: Use `unsafe`

Screw lifetimes. Let me do what I want to do.

Using `unsafe` will, in appearance, solve the issue:

```rust
impl<'a> Space<'a> {
    fn create_asteroid(&mut self) {
        let new_asteroid = Asteroid { name: "NEW" };
        self.new_asteroids.push(new_asteroid);
        let new_asteroid = self.new_asteroids.last().unwrap() as *const Asteroid;
        self.asteroids.push(unsafe { &*new_asteroid });
    }
}
```

We are here basically coercing the lifetime of the pointer to an object inside
`new_asteroids` to `'a`.


YOU MUST MAKE SURE THAT THE INTERFACE PROVIDED WILL BE SAFE!

If another developer were to destroy any instance of `Asteroid` inside
`self.new_asteroids` (with somethink like
[Vec::clear](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.clear)),
this would result in undefined behavior the next time the vector
`self.asteroids` is used.

## Solution 2: Use [`std::borrow::Cow`](https://doc.rust-lang.org/std/borrow/enum.Cow.html)

Now, we could use `Cow`, so that `asteroids` contain both borrowed and owned
values. `Cow` allows to encapsulate a piece of data why may or may not be owned.
This is convenient when you do not know statically whether a value will always
be owned or always be borrowed.

```rust
use std::borrow::Cow;

/// Cow requires the encapsulated value to implement Clone
#[derive(Clone, Copy)]
struct Asteroid {
    name: &'static str,
    // More stuff related to the asteroid.
}

struct Space<'a> {
   asteroids: Vec<Cow<'a, Asteroid>>,
}

impl<'a> Space<'a> {
    /// Create Space from a slice of Asteroids
    fn new(asteroids: &'a [Asteroid]) -> Self {
        Self { asteroids: asteroids.iter().map(Cow::Borrowed).collect() }
    }

    /// Create a new owned asteroid
    fn create_asteroid(&mut self) {
        let new_asteroid = Asteroid { name: "NEW" };
        self.asteroids.push(Cow::Owned(new_asteroid));
    }
}

fn main() {
    let asteroid_ceres = Asteroid { name: "Ceres" };
    let asteroid_trojan = Asteroid { name: "Trojan" };
    let asteroids = vec![asteroid_ceres, asteroid_trojan];
    let mut space = Space::new(&asteroids);
    space.create_asteroid();
}
```

Now we have all our `Asteroid`s inside the same data-structure thanks to `Cow`!

However, `Cow` is quite costly. It requires the encapsulated object to be
clonable. It must implement `Clone` (`ToOwned` to be exact).
Do we require its `Clone-On-Write` feature? Maybe yes, maybe not.

If we do not require to change a borrowed value, we could as well just use
another kind of smart pointer with less constraints.
Let's call it `Bow` (`Borrow-Or-oWned`).

## Solution 3: `Bow` (Borrow Or oWned), your own smart pointer

The type `Bow` can enclose and provide immutable access to borrowed data, and
gives mutable acess when owned.

It implements the `Borrow` and `Deref` traits for ease of use.

```rust
use std::borrow::Borrow;
use std::ops::Deref;

pub enum Bow<'a, T: 'a> {
    Owned(T),
    Borrowed(&'a T)
}

impl<'a, T: 'a> Borrow<T> for Bow<'a, T> {
    fn borrow(&self) -> &T {
        match self {
            &Bow::Owned(ref t) => t,
            &Bow::Borrowed(t) => t,
        }
    }
}

impl<'a, T: 'a> Deref for Bow<'a, T> {
    type Target = T;
    fn deref(&self) -> &T {
        self.borrow()
    }
}

/// Helper functions to get mutable access to the encapsulated data
impl<'a, T: 'a> Bow<'a, T> {
    pub fn borrow_mut(&mut self) -> Option<&mut T> {
        match self {
            &mut Bow::Owned(ref mut t) => Some(t),
            &mut Bow::Borrowed(_) => None,
        }
    }

    pub fn extract(self) -> Option<T> {
        match self {
            Bow::Owned(t) => Some(t),
            Bow::Borrowed(_) => None,
        }
    }
}
```

Our code does not sensibly change. With `Bow`, we just need to replace `Cow`
with `Bow`. And everything compiles and works!

```rust
// ...
struct Space<'a> {
   asteroids: Vec<Bow<'a, Asteroid>>,
}

impl<'a> Space<'a> {
    fn new(asteroids: &'a [Asteroid]) -> Self {
        Self { asteroids: asteroids.iter().map(Bow::Borrowed).collect() }
    }

    fn create_asteroid(&mut self) {
        let new_asteroid = Asteroid { name: "NEW" };
        self.asteroids.push(Bow::Owned(new_asteroid));
    }
}
// ...
```

As always, rust enforces us to make good design decision with our data
structure!
