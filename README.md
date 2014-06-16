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
document.write("Hello, $<_>, you cannot XSS me!".$(userProvidedName));
```

The library comes with several additional formatters:

### Significant Figures

The "sf" formatter supplies a given number of significant figures.  It tends to improve on javascript's natural tendency to write things like "you have 2.000000000001 dogs".  It takes a number of digits as an optional argument.  For example:

|Value|$&lt;sf:_&gt;|$&lt;sf:2:_&gt;|
|-----|-------|---------|
|123.4|123|123|
|12.34|12|12|
|1.234|1|1.2|
|.1234|0.1|0.12|
|.01234|0.01|0.012|

### System International Suffixes

There are times when long numbers aren't the clearest option.  For those, the library offers SI prefixes.  You can either use standard base 10 or by passing an optional parameter of 2 CS-favored base 1024.  For example:
```javascript
'To transmit $<si:2:_>B at $<si:_>B/s will take $<si:_>s<br>'.$(3*1024*1024*1024, 100*1000*1000, 3*1024*1024*1024 / (100*1000*1000))
```
produces
```
To transmit 3.0GiB at 100MB/s will take 32s
```

### Hexadecimal

To print a number in hex, use the $<h:_> or $<H:_> depending on whether you prefer upper or lower case letters for digits a-f.

### Creating Your Own

To add text formatters, put the function inside the String.prototype.$.formatters object, like so:

```javascript
String.prototype.$.formatters.sc = function(value, /*optional*/ numborks) { // Swedish Chef formatter
  value=value.toString();
  if (typeof(numborks) == 'undefined') numborks=3;
  for (var i=0; i<numborks; i++) {
    value += 'bork';
  }
  return value;
}

document.write('The chef says "$<sc:_>". What do you say?'.$('hello'));
```

## Error Handling

Various things can go wrong in string interpolation.  A requested value might not be provided, or a formatting parameter could be invalid.  By default, the library produces a textual error message and interpolates that into the string surrounded by {{{}}}.  For example,

```javascript```
'text $_ $_ stuff <br>'.$(3)
```
produces
```
text 3 {{{Not enough arguments (have 1 want 2}}} stuff
```

This is visually jarring, but should make for comparatively easy debugging, as the error message is given with the maximum context.

If you prefer exception, you can set 

```javascript
String.prototype.$.throwOnError = true;
```

and instead of being interpolated, these strings will be thrown as exceptions.  Strings are not the ideal things to be thrown as exceptions, but the ability to recover in software is limited anyway.  In most cases, it is better to leave this parameter off and be careful to only use the library in ways that will not produce errors.

Note that this is a single parameter for the entire library.  Changing it frequently is not recommended, as it may result in strange nonlocal behavior.  Changing it frequently in multithreaded code may result in demons flying out of your nose.
