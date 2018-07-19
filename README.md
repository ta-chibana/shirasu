# Shirasu

## Usage

1. install BitBar

```
$ brew cask install bitbar
```

2. setup plugin folder
3. clone

```
$ git clone git@github.com:ta-chibana/shirasu.git
```

4. install modules

```
$ cd /path/to/shirasu
$ yarn
```

5. setup `.env`

```
LOGIN_ID=xxxxx
PASSWORD=yyyyy
TARGET_URL=zzzzz
```

6. create links

```
$ cd /path/to/plugin_folder
$ ln -s /path/to/shirasu/index.js shirasu.30m.js
$ ln -s /path/to/shirasu/.env .env
```

7. Refresh BitBar
