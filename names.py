# replace the alias
NAMES = {
    "alice": "xxxxxxxxx@s.whatsapp.net",
    "bob": "yyyyyyyyy@s.whatsapp.net",
}


def id_to_name(id):
    for (k, v) in NAMES.iteritems():
        if id == v:
            return k
    return None


def name_to_id(name):
    return NAMES.get(name.lower())