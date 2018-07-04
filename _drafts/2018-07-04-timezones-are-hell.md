---
layout: post
title: "Timezones are hell"
language: en
keywords: python timezone postgres
---

Timezones are hell.
This is really the kind of hell you don't want to get into, unless you really
need to.

After getting timezone issues, I started wishing that all countries switch
to UTC!

Alas, timezones, like many things, are hear to stay.
Until the 19th century, each city had its own local time calculated from the
sun's movements. However, interconnections between communities forced
the people to agree on a common time, a.k.a a time zone.

Unfortunately, as will all human aggreements, timezones do not correlate very
well with natural phenomena, here, Earth's geometry.
While both are continent-size contries, the US shares 5 timezones, while China
only has _one_ single timezone.
Then some countries include energy-saving time changes. They even move 1 hour
in some countries during specific periods (e.g. Morocco during the month of Ramadam).
Or did you know that an island in the Pacific changed _date_ after its leaders
decided to move to the other side of the international date-changing line?

Hopefully a lot of experienced developers thought really hard to solve these
issues, both for database management systems and programming languages.

# Timezones in Python

Let's take a look at Python's most known solution to the timezone mess.

Let's fire up a Python REPL:

```py
>>> from datetime import datetime
>>>
>>> datetime.now()
datetime.datetime(2018, 7, 4, 7, 48, 7, 17268)
```

So it's now July 4th 2018 7:48:07 AM (and some microseconds).
This is my local time.

Python has a handy function to get UTC time:

```py
>>> datetime.utcnow()
datetime.datetime(2018, 7, 3, 22, 51, 17, 827155)
```

So it's now July 3rd 2018 22:51:17 (and some microseconds) in UTC time.

But where is the timezone information? How do I know, given a python `datetime`,
what is the the timezone of the specific time?
Well, that may sound harsh, but you **cannot**.

By default, all datetimes in python are said to be "timezone-unaware"!

## Timezone-awareness in Python

As it appears, Python has two datetime types. One is said "timezone-unaware",
while the other is said "timezone-aware".

Let's make a timezone-aware datetime. For that we will use the `pytz` module.


```py
>>> import pytz
>>>
>>> # Create a timezone object
>>> tz = pytz.timezone('Asia/Tokyo')
>>> datetime.datetime.now(tz
datetime.datetime(2018, 7, 4, 8, 2, 39, 637167, tzinfo=<DstTzInfo 'Asia/Tokyo' JST+9:00:00 STD>)
```

Cool! As you see, the `datetime.now` function can take a timezone object as
argument, if you do so, it will return a the current time in the given timezone
as a timezone-aware datetime.

As you can see, if the `tzinfo` attribute is set, then a datetime becomes
timezone-aware. You can easily check if a datetime is tz-aware as follows:

```py
def am_i_tzaware(dt):
    return dt.tzinfo is not None
```

However, there is something you should never, never do (unless you know what
you are doing): manually changing the `tzinfo` attribute of a datetime, either
by setting the attribute or using the `replace` method. This **WILL NOT**
do what you think it will do. You will get behaviour that 99.99% of people do
not want.

Let's try:

```py
>>> from datetime import datetime
>>> import pytz
>>>
>>> tokyo_tz = pytz.timezone('Asia/Tokyo')
>>> paris_tz = pytz.timezone('Europe/Paris')
>>> tokyo_time = datetime.now(tokyo_tz)
>>> paris_time = tokyo_time.replace(tzinfo=paris_tz)
>>> paris_time
datetime.datetime(2018, 7, 4, 8, 12, 23, 903127, tzinfo=<DstTzInfo 'Europe/Paris' LMT+0:09:00 STD>)
```

Please take a clear look at the information after the `tzinfo` keyword.
WTF??? What the heck is this 9 minutes offset???
Have you ever heard of a timezone named LMT+0:09:00???


## Deeper look into `pytz`

Please explain what is this 9 minutes offset! If my program keeps on like this,
calamity will happen.

Well, these are historical timezones (yes, they existed!). And people dealing
with times from the first half of the 20th century may need them.

`pytz` can actually deal with the timezones of almost any region after the 1900s.

And if you only use the timezone object as is, it may show a historical offset for
the area.

```py
>>> tokyo_tz
<DstTzInfo 'Asia/Tokyo' LMT+9:19:00 STD>
>>> paris_tz
<DstTzInfo 'Europe/Paris' LMT+0:09:00 STD>
```

When you use the `now` function, the timezone object will update itself
to use the correct offset that politics-driven prople chose at the current time
in the selected region.
But how do I convert the time to another timezone then?

Here is what you can do with a `tzaware_localize` function:

```py
import datetime
import pytz


def tzaware_localize(dt: datetime.datetime, local_tz: str):
    """
    Takes a TZ-unaware datetime in local time *or* a TZ-aware datetime and turns
    it into a TZ-aware datetime in the provided timezone.
    :return: TZ-aware DateTime in the provided timezone
    """
    if dt.tzinfo is None:
        return pytz.timezone(local_tz).localize(dt)
    else:
        return dt.astimezone(pytz.timezone(local_tz))
```

Let's try to use it:

```py
>>> # Localize TZ-unaware datetimes to the selected timezone
>>> tzunaware_in_tokyo = datetime.datetime.now()
>>> tzaware_in_tokyo = tzaware_localize(tzunaware_in_tokyo, 'Asia/Tokyo')
>>> tzaware_in_tokyo
datetime.datetime(2018, 7, 4, 8, 32, 32, 680085, tzinfo=<DstTzInfo 'Asia/Tokyo' JST+9:00:00 STD>)
>>>
>>> ### Convert a datetime to another timezone
>>> now_in_paris = tzaware_localize(tzaware_in_tokyo, 'Europe/Paris')
>>> now_in_paris
datetime.datetime(2018, 7, 4, 1, 32, 32, 680085, tzinfo=<DstTzInfo 'Europe/Paris' CEST+2:00:00 DST>)
```

Basically, if you add timezone information to a timezone unaware datetime,
please use the `localize` method of the datetime object.
Please use `astimezone` if you want to convert a tzaware datetime to a
different timezone.

## Python ecosystem

As a side note to the Python world, numpy does not currently support
timezone-aware datetimes at the time of writing, while pandas does!

Though I would advise you to store and process all times as UTC. They should
only be converted when you need to show them to the user.

Here is how you can convert a series to UTC tz-aware datetime in pandas:

```py
from datetime import datetime
import pandas as pd

utc_timestamp = pd.to_datetime(datetime.now(), utc=True)
```
For communication with a database system, there are plugins for SQLAlchemy
that handles tz-aware datetimes. Please consider [sqlalchemy-utc](https://github.com/spoqa/sqlalchemy-utc/) for example.

# Databases: Example with PostgreSQL

You should store all times as UTC in databases.
PosgreSQL has two types to store datetimes:

- TIMESTAMP WITHOUT TIME ZONE
- TIMESTAMP WITH TIME ZONE

But don't be fooled. None of them actually *store* time zone information.

A `TIMESTAMP WITHOUT TIME ZONE` is just used as is, while a
`TIMESTAMP WITH TIME ZONE` is implicitly converted to the connection's timezone
everytime the value is read. That's the only different.
In term of data representation, they store the same thing.

If the connection timezone is not set, a `TIMESTAMP WITH TIME ZONE` will be converted to whatever
default your PostgreSQL instance is configured with (usually UTC).

You can check your connection's timezone with:

```sql
SHOW TIMEZONE;
```

By default, the query should return 'UTC'.

You can set your connection's timezone with:

```sql
SET TIME ZONE 'Asia/Tokyo';
```

Then `SHOW TIMEZONE` will return 'Asia/Tokyo', and all `TIMESTAMP WITH TIME ZONE`
will be converted from UTC to the timezone (+9 hour offset for Japan for a
post-war datetime).

You should especially be cautious when dealing with dates! What date a timestamp
falls on is dependent on the timezone!
The date now is 2018-07-04 in Tokyo, but 2018-07-03 in New York.

```sql
SELECT * FROM my_table
-- Here, the UTC datetime will be converted to the date in the connection's timezone!
WHERE my_table.datetime_column::date = '2018-07-04'::date
```

If your business analytics software happens to connect to a PostgreSQL database,
do not forget to set the connection timezone appropriatly! If not, you may get
surprises when you query the database!

**NB:**
- PostgreSQL actually has a TIMEZONE type. So if need be, you may store the timezone
of a timestamp in another column.
- If you ever need to explicitly convert to a specific timezones, you can use the
"AS TIME ZONE" operator.
