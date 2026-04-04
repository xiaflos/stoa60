export type Lang = "el" | "en";

export const translations: Record<string, Record<Lang, string>> = {
  // ─── Navigation ───
  "nav.home":     { el: "Home", en: "Home" },
  "nav.posters":  { el: "Posters", en: "Posters" },
  "nav.about":    { el: "About", en: "About" },

  // ─── Hero (Home) ───
  "hero.title":       { el: "STOA60", en: "STOA60" },
  "hero.subtitle1":   { el: "υπόγειος συναυλιακός χώρος στο Ηράκλειο,", en: "DIY underground venue in Iraqlion," },
  "hero.subtitle2":   { el: "10 χρόνια λάϊβ, να τα εκατοστήσουμε.", en: "10 years, few hundred gigs and counting." },
  "hero.nextgig":     { el: "next gig", en: "next gig" },
  "hero.newsletter":  { el: "gig mail alert", en: "gig mail alert" },
  "hero.placeholder": { el: "your@email.com", en: "your@email.com" },
  "hero.subscribe":   { el: "Subscribe", en: "Subscribe" },

  // ─── About ───
  "about.title":     { el: "about", en: "about" },
  "about.intro":     { el: "Η Στοα 60 είναι μία ομάδα που διοργανώνει συναυλίες σχεδόν εβδομαδιαία από το 2015, σε ένα υπόγειο στο κέντρο του Ηρακλείου Κρήτης.", en: "Stoa 60 is a DIY underground venue in the center of Heraklion (Crete) that has operated nearly every Saturday since 2015, organizing over 250 gigs during this span." },
  "about.manifesto": { el: "Η ομάδα λειτουργεί οριζόντια στη λογική του DIY προσπαθώντας να ελαχιστοποιήσει τις εμπορικές συναλλαγές σε όλες τις διαδικασίες της. Τα έσοδα του χώρου προέρχονται από το κουτί ενίσχυσης και την ελεύθερη συνεισφορά στο Bar και διατίθενται αποκλειστικά για την κάλυψη των λειτουργικών εξόδων (ρεύμα, ενοίκιο) τη συντήρηση της υποδομής και των μεταφορικών εξόδων των μπαντών. Φιλοξενούμε σχήματα της ανεξάρτητης μουσικής σκηνής, καλύπτοντας ένα μεγάλο εύρος αισθητικής και ήχου και φιλοδοξούμε σε ένα περιβάλλον χωρίς διαχωρισμούς μεταξύ μουσικών-κοινού-διοργανωτών. Βλέπουμε την μουσική σαν ένα μέσο έκφρασης, διάδοσης ιδεών και πάνω απ'όλα σαν μια αφορμή κοινωνικοποίησης, αλληλεπίδρασης και συνδιαμόρφωσης.", en: "We instill a hands-on DIY ethic in an attempt to minimize transactions and maintain high quality concerts while relying on voluntary contributions. Suggested prices at the bar are kept at a minimum and reflect actual costs: equipment, rent, electricity, and most critically band transportation from the mainland. Any surplus goes directly back into improving infrastructure or supporting other initiatives. Our sustainability depends on collective participation between organizers, musicians, and the audience. By decommodifying all aspects of a gig, we've created a genuinely accessible independent space, and we channel live music as means for social mobilization. We host artists that would be considered part of the independent music scene, and we stand critical towards the modern entertainment industry. Stoa60 is the space for all who don't belong, transforming every week to accommodate a large diversity of aesthetics and cultures." },

  // ─── Gig Calendar ───
  "cal.april": { el: "Απρίλιος", en: "April" },
  "cal.may":   { el: "Μάιος",    en: "May"   },

  // ─── Locations (Posters page) ───
  "loc.seasons":    { el: "Σεζόν",            en: "Season"          },
  "loc.locations":  { el: "Τοποθεσία",        en: "Location"        },
  "loc.underground":{ el: "Underground",      en: "Underground"     },
  "loc.georgiadis": { el: "Πάρκο Γεωργιάδη", en: "Georgiadis Park" },
  "loc.karabolas":  { el: "Καραβολάς",        en: "Karabolas"       },
  "loc.voutes":     { el: "Βούτες",           en: "Voutes"          },
  "loc.xenia":      { el: "Ξένια",            en: "Xenia"           },

  // ─── Festivals (Posters page) ───
  "loc.festivals": { el: "Φεστιβάλ", en: "Festivals" },
  // ─── BA2037 ───
  "ba2037.description": {
    el: "Η ΒΑ2037 είχε κάποια κοινά μέλη με τη στοά60, επικεντρωνόταν στον ηλεκτρονικό και πειραματικό ήχο και οργάνωσε συναυλίες τόσο εντός όσο και εκτός στοάς.",
    en: "BA2037 was a separate entity that focused on organising experimental and electronic gigs inside Stoa60 as well as in a variety of public locations.",
  },

  // ─── Works / Posters ───
  "works.upcoming":   { el: "Προσεχώς",     en: "Upcoming"   },
  "works.for_print":  { el: "Για τύπωμα",   en: "For Print"  },
  "works.bar":        { el: "Bar",          en: "Bar"        },
  "works.title":      { el: "Posters",      en: "Posters"    },

  // ─── Footer ───
  "footer.contact": { el: "Contact:", en: "Contact:" },

  // ─── 404 ───
  "404.title":   { el: "Page Not Found", en: "Page Not Found" },
  "404.message": { el: "Oops! It seems the page you are trying to access is broken or does not exist!", en: "Oops! It seems the page you are trying to access is broken or does not exist!" },
  "404.back":    { el: "Go back to the homepage", en: "Go back to the homepage" },
};
