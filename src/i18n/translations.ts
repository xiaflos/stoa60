export type Lang = "el" | "en";

export const translations: Record<string, Record<Lang, string>> = {
  // ─── Navigation ───
  "nav.home":     { el: "Home", en: "Home" },
  "nav.posters":  { el: "Posters", en: "Posters" },
  "nav.about":    { el: "About", en: "About" },

  // ─── Hero (Home) ───
  "hero.title":       { el: "STOA60", en: "STOA60" },
  "hero.subtitle1":   { el: "υπόγειος συναυλιακός χώρος στο Ηράκλειο,", en: "DIY underground venue in Iraqlion," },
  "hero.subtitle2":   { el: "Στηρίζουμε το κουτί. Σεβόμαστε τη γειτονιά.", en: " " },
  "hero.subtitle3":   { el: "10 χρόνια λάϊβ.", en: "10 years, few hundred gigs and counting." },
  "hero.nextgig":     { el: "next gig", en: "next gig" },
  "hero.newsletter":  { el: "gig mail alert", en: "gig mail alert" },
  "hero.placeholder": { el: "your@email.com", en: "your@email.com" },
  "hero.subscribe":   { el: "Subscribe", en: "Subscribe" },
  "hero.subscribed":  { el: "Θα σας ειδοποιήσουμε..", en: "You'll be notified in the next few days." },

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
    el: "Η ΒΑ2037 είχε κάποια κοινά μέλη με τη στοά60, επικεντρωνόταν στον ηλεκτρονικό και πειραματικό ήχο και οργάνωσε συναυλίες τόσο εντός όσο και εκτός στοάς.\n\nΗ ομάδα αποτελείται από μουσικούς, μουσικόφιλους και Djs με κοινή επιθυμία να βρούμε χώρο και χρόνο στο Ηράκλειο να ακούσουμε /παίξουμε / χορέψουμε / αναπαράγουμε τη μουσική που γουστάρουμε. Κινούμαστε στον ωκεανό της ηλεκτρονικής και πειραματικής μουσικής και θα θελαμε να προσεγγίσουμε τα βάθη της.\n\nΕπιδιώκουμε να δώσουμε χώρο σε μουσική η οποία δεν ακούγεται σε μέρη που συχνά διασκεδάζουμε, δεν προωθείται από την κυρίαρχη μουσική βιομηχανία και πολλές φορές ειναι αποτελεσμα αυτοσχεδιασμού και πειραματισμού. Σκοπεύουμε στην ανάδειξη και ανακάλυψη διαφόρων και διαφορετικών αισθήσεων, αισθητικών, τρόπων απόλαυσης και επικοινωνίας, τρόπων δημιουργίας και έκφρασης γύρω από την ηλεκτρονική και πειραματική μουσική.\n\nΣτόχος μας είναι η διοργάνωση μουσικών εκδηλώσεων και η συνεργασία με άλλους ανάλογους χώρους και πρωτοβουλίες στο Ηρακλειο με κοινές επιδιώξεις, τρόπους λειτουργίας και ύπαρξης.\n\nΥπάρχουμε ανεξάρτητα και αντιεραρχικά, χωρίς χορηγούς, έξω από μαγαζιά, χωρίς να αποσκοπούμε με κανένα τρόπο σε προσωπικό οικονομικό κέρδος, ουτε εμείς αλλά ούτε και οι καλλιτέχνες που φιλοξενούνται στα live. Σε όλες τις εκδηλώσεις που διοργανώνονται η είσοδος είναι ελεύθερη, καθως δεν θελουμε να αποκλείσουμε κανέναν και καμία. Παρόλα αυτά θεωρούμε την ενίσχυση μέσω του κουτιού απαραίτητη για την κάλυψη των λειτουργικών εξόδων, τοσο της ομάδας όσο και των χώρων που ενίοτε μας φιλοξενούν (Στοα 60) καθώς και για την συνέχιση και αναβάθμιση του όλου εγχειρήματος.\n\nΈχουμε ανάγκη να διαμορφώσουμε εκείνες τις συνθήκες μέσα στις οποίες κάθε άτομο θα μπορέσει να απολαύσει την μουσική, να εκφραστεί όπως νιώθει και κάθε σώμα θα έχει ίση ευκαιρία να διεκδικήσει το χώρο ανάμεσα στα άλλα χωρίς να περιορίζεται και να περιορίζει. Θα θέλαμε οι συναντήσεις που διοργανώνουμε εμείς να αποτελούν ασφαλείς χώρους για όλα τα άτομα και έτσι ομοφοβικές, εξουσιαστικές, τρανσφοβικές, σεξιστικές, ρατσιστικές και άλλες συμπεριφορές έκφρασης μίσους που επιβάλλονται βίαια πάνω σε αυτονόητες ελευθερίες, δεν είναι ανεκτές.\n\nSee you on the dancefloor",
    en: "BA2037 was a separate entity that focused on organising experimental and electronic gigs inside Stoa60 as well as in a variety of public locations.\n\nThe project consists of people that are interested in music, musicians and Djs with common desire to find space and time in order to listen/play/dance/(re) produce the music that we enjoy. We find ourselves somewhere in the ocean of electronic and experimental music and we would like to access the very depths of it.\n\nWe want to create room to music that does not exist to places that we usually get entertained, music that is not being promoted by the main music industry and music that, from time to time, is a result of our improvisation and experimentation. We are targeting to the prominence and discovery of different kinds of consciousness, feelings, ways of joy and communication, ways of creation and expression that are being surrounded by the electronic and experimental music.\n\nOur target is the organization of electronic music events and the cooperation with other equivalent groups, teams and initiatives that exists in Heraklion which serves the same goals, modes of operation and existence.\n\nWe exist independently and non-hierarchically, with no sponsors, outside of stores, bars, clubs, with no intention to gain in any way any personal financial profit, neither us nor the artists that are coming to perform. To all of our events there is a free entrance in order for nobody to be excluded. Nonetheless, we believe that the enhancement through the box is necessary to cover the functional expenses of the team and groups/teams/projects that we are cooperating (Stoa60) as well as for the continuation of the whole project.\n\nWe feel the need to create these circumstances where each person will be able to enjoy the music, to express theirself as they feel and every human body will have equal opportunities to claim its own space between the space of the others without creating constraints and without being constrained. The meetings that we organise, we imagine them as meetings where the place is safe for each and every person, thus, homophobic, authoritative, transphobic, sexistic and other behaviors of racist nature are not going to be accepted/tolerated.\n\nSee you on the dancefloor!",
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
