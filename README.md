String Formatting
=================

Are you tired of writing

```javascript
"the "+animal+" said '"+noise+".'"
```

or worse

```javascript
"the " + animal + " said '" + noise + ".'"
```

and trying to keep all the spacing and punctuation straight?  If so, this library may be for you.

## Simplest Case

The basic use case looks like this:

```javascript
"the $_ said '$_.'".$(animal,noise)
```

Animal and noise are inserted to replace the $_ characters.  This lets you write natural-looking text and interpolate variables in a compact way.

## Names, Numbers and Underscores

There are three different ways to refer to a variable to be interpolated.  It is generally wise not to mix them:

```javascript
"the $_ said '$_.'".$(animal,noise)
"the $0 said '$1.'".$(animal,noise)
"the $noun said '${exclamation}.'".$({noun:animal, exclamation:noise})
```

In the underscore case, the values are taken in order.  In the numbered case, they are taken by index counting from zero.  In the named case, they use the keys from the map.  In the numbered and named cases, values can repeat.

The underscore case is most compact, and generally preferable for simple situations.

The numbered case adds the ability to repeat and re-order, while remaining compact.  This is especially useful if you are translating into a language with different word orders.

The named case sacrifices compactness to achieve clarity in the format string.

## Curly Braces

Any interpolation target *can* be enclosed in {}.  This is only necessary when not doing so would be ambiguous.  For example:

```javascript
"Over ${0}000000 sold".$(millionsSold)
"Now ${prefix}learn the material".$({prefix:"un"})
```

When in doubt, include the {}.

## Extra formatters

In addition to direct interpolation, the library can run a formatter first.  To invoke this, use angle brackets.  Like so:

```
$<formatter:additional:parameters:interpolationTarget>
```

If the formatter requires no parameters, you may omit them and use

```
$<formatter:interpolationTarget>
```

If you also omit formatter, an HTML escaper will be used (this inspired the choice of angle brackets).  For example:

```javascript
"Hello, $<_>, you cannot XSS me!".$(userProvidedName)
```

The library comes with several additional formatters:

### Significant Figures

The "sf" formatter supplies a given number of significant figures.  It tends to improve on javascript's natural tendency to write things like "you have 2.000000000001 dogs".  It takes a number of digits as an optional argument.  For example:

|Value|$<sf:_>|$<sf:2:_>|
|-----|-------|---------|
|123.4|123|123|
|12.34|12|12|
|1.234|1|1.2|
|.1234|0.1|0.12|
|.01234|0.01|0.012|
