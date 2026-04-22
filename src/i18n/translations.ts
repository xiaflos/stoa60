export type Lang = "el" | "en";

export const translations: Record<string, Record<Lang, string>> = {
  // ─── Navigation ───
  "nav.home":     { el: "Home", en: "Home" },
  "nav.posters":  { el: "Posters", en: "Posters" },
  "nav.about":    { el: "About", en: "About" },

  // ─── Hero (Home) ───
  "hero.title":       { el: "STOA60", en: "STOA60" },
  "hero.subtitle1":   { el: "υπόγειος συναυλιακός χώρος στο Ηράκλειο,", en: "DIY underground venue in Iraqlion," },
  "hero.subtitle2":   { el: "Στηρίζουμε το κουτί. Σεβόμαστε τη γειτονιά.", en: "10 years, few hundred gigs and counting." },
  "hero.subtitle3":   { el: "2015-2026.", en: "support your local diy scene." },
  "hero.nextgig":     { el: "next gig", en: "next gig" },
  "hero.newsletter":  { el: "gig alert / newsletter", en: "gig alert / newsletter" },
  "hero.placeholder": { el: "your@email.com", en: "your@email.com" },
  "hero.subscribe":   { el: "Subscribe", en: "Subscribe" },
  "hero.subscribed":  { el: "Θα σας ειδοποιήσουμε..", en: "You'll be notified in the next few days." },

  // ─── About ───
  "about.title":     { el: "about", en: "about" },
  "about.intro":     { el: "Η Στοα 60 είναι μία ομάδα που διοργανώνει συναυλίες σχεδόν εβδομαδιαία από το 2015, σε ένα υπόγειο στο κέντρο του Ηρακλείου Κρήτης.", en: "Stoa 60 is a DIY underground venue in the center of Heraklion (Crete) that has operated nearly every Saturday since 2015, organizing over 250 gigs during this span." },
  "about.manifesto": { el: "Η ομάδα λειτουργεί οριζόντια στη λογική του DIY προσπαθώντας να ελαχιστοποιήσει τις εμπορικές συναλλαγές σε όλες τις διαδικασίες της. Τα έσοδα του χώρου προέρχονται από το κουτί ενίσχυσης και την ελεύθερη συνεισφορά στο Bar και διατίθενται αποκλειστικά για την κάλυψη των λειτουργικών εξόδων (ρεύμα, ενοίκιο) τη συντήρηση της υποδομής και των μεταφορικών εξόδων των μπαντών. Φιλοξενούμε σχήματα της ανεξάρτητης μουσικής σκηνής, καλύπτοντας ένα μεγάλο εύρος αισθητικής και ήχου και φιλοδοξούμε σε ένα περιβάλλον χωρίς διαχωρισμούς μεταξύ μουσικών-κοινού-διοργανωτών. Βλέπουμε την μουσική σαν ένα μέσο έκφρασης, διάδοσης ιδεών και πάνω απ'όλα σαν μια αφορμή κοινωνικοποίησης και συνδιαμόρφωσης.", en: "We instill a hands-on DIY ethic in an attempt to minimize transactions and maintain high quality concerts while relying on voluntary contributions. Suggested prices at the bar are kept at a minimum and reflect actual costs: equipment, rent, electricity, and most critically band transportation from the mainland. Any surplus goes directly back into improving infrastructure or supporting other initiatives. Our sustainability depends on collective participation between organizers, musicians, and the audience. By decommodifying all aspects of a gig, we've created a genuinely accessible independent space, and we channel live music as means for social mobilization. We host artists that would be considered part of the independent music scene, and we stand critical towards the modern entertainment industry. Stoa60 is the space for all who don't belong, transforming every week to accommodate a large diversity of aesthetics and cultures." },

  // ─── Gig Calendar ───
  "cal.april":     { el: "Απρίλιος",      en: "April"     },
  "cal.may":       { el: "Μάιος",         en: "May"       },
  "cal.september": { el: "Σεπτεμβριος",   en: "September" },

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
  // ─── Xenia ───
  "xenia.text": {
    el: "Μερικά χρόνια μετά την ανάπλαση της παραλιακής του Ηρακλείου και το κλείσιμο του ξενοδοχείου από του οποίου πήρε το όνομα η συγκεκριμένη τοποθεσία, μια μικρή απλωσιά εμφανίστηκε μόλις 10 λεπτά από το κέντρο της πόλης. Το παραθαλλάσιο αμφιθεατρικό του \"ξενία\" έγινε για μια 5ετία τόπος συνάντησης μιας μεγάλης κοινότητας. Τα πάρτυ στις αρχές και τα τέλη του Καλοκαιριού από το 2016 μέχρι το 2018 είχαν γίνει εβδομαδιαία. Αυτοργανωμένες ομάδες της πόλης, φοιτητικοί σύλλογοι ή απλά παρέες που βολόδερναν κάθε βράδυ εκεί, οικειοποιήθηκαν το χώρο και όλο αυτό άρχισε σιγά σιγά να \"ξενίζει\". Τα τοπικά μίντια δημιούργησαν το κλίμα, διάφοροι κάτοικοι ξεκίνησαν τις καταγγελίες και το 2018 ο κύκλος του Ξενία έκλεισε.",
    en: "A few years after the renovation of Heraklion's waterfront and the shut-down of the hotel that gave this particular spot its name, a small open expanse appeared just 10 minutes from the city centre. The seaside amphitheatre known as \"Xenia\" spent the better part of five years as a meeting point for a large and sprawling community. What began as parties at the bookends of summer gradually turned into a weekly ritual, running from 2016 through to 2018. Self-organized city collectives, student associations, and loose groups of people who simply found themselves there night after night made the space their own — and it was precisely this slow, organic takeover that started to rub certain people the wrong way. Local media worked to build a narrative around it, residents began lodging formal complaints, and by 2018 the Xenia era had run its course.",
  },
  // ─── Georgiadis Park ───
  "georgiadis.intro": {
    el: "Το πάρκο Γεωργιάδη βρίσκεται στην καρδιά της πόλης και αποτελεί μία ανάσα πρασίνου μέσα στην εμπορική τσιμεντούπολη του κέντρου. Υπήρξε ένας αναγκαίος χώρος πολιτιστικής ζωής φιλοξενώντας ένα τεράστιο εύρος εκδηλώσεων από πολλούς και ετερόκλητους φορείς της πόλης του Ηρακλείου.",
    en: "Georgiadis Park lies at the heart of the city, a rare patch of green breathing room amid the commercial concrete maze of the city centre. For years it has served as a vital hub of cultural life, opening its grounds to an eclectic mix of events organized by the many and varied groups that make up the fabric of Heraklion.",
  },
  "georgiadis.body": {
    el: "Το 2017 ο δήμος ανακοινώνει το σχέδιο μίας τελείως πρόχειρης και επικύνδινης ανάπλασης. Ο αγώνας για τον βασικότερο πνεύμονα της πόλης γεννάει τις Φυλές του Πάρκου, μία ανοιχτή συνέλευση που αναλαμβάνει τη προστασία του, τη νομική υπεράσπιση και τη διαχείριση του. Το διάστημα που περνάει η κινητοποίηση είναι έντονη, συμβαίνουν μεγάλες πορείες και αυτό φέρνει μία τρομερή δυναμική στις εκδηλώσεις, αλλά και στην γενικότερη οικειοποίηση, διαμόρφωση και αντίληψη του χώρου αυτού ως κοινό. Η ομάδα της στοάς60 έκανε την παρθενική της εκδήλωση στο πάρκο τον μακρινό Οκτώβρη του 2015, πριν καν στηθεί το υπόγειο στη Καλοκαιρινού και κατά τη διάρκεια της κινητοποίησης του 2018 ήταν πάλι εκεί και έστησε μια σειρά προβολές και αξιομνημόνευτα λάϊβ.\n\nΤον Οκτώβρη του 2019, μετά από το πιο όμορφο καλοκαίρι του Πάρκου, με τη δικαστική διαμάχη να τραβάει, ο δήμος, ο εργολάβος μαζί με τα ΜΑΤ αποφασίζουν να προχωρήσουν με τα έργα της ανάπλασης. Την ημέρα εκείνη η ευρύτερη κοινότητα που ενώθηκε γύρω από αυτό τον αγώνα, θα κοντραριστεί σώμα με σώμα με τους αστυνομικούς, θα κερδίσει τη συγκεκριμένη μάχη, αλλά δεν θα αντέξει στην καθημερινότητα της επιβολής της αστυνομιας και των εκσαφέων τους. Το πάρκο περυτιλίγεται με λαμαρίνες και θα περάσουν 2-3 χρόνια και κάμποση καραντίνα μέχρι να το ξαναδούμε. Όταν αυτό πλέον άνοιξε, με ένα τελείως διαφορετικό καθεστώς. Στο βασικό χώρο που φιλοξενούνταν λάϊβ έχει πλέον τις τεράστιες ομπρέλες του καφέ που εκμεταλλεύεται ιδιώτης, υπάρχει ένας σεκιουριτάς μόνιμα στο χώρο και το καθεστώς άδειας καθορίζεται από την αναπαραγωγική σεζόν διαφόρων πτηνών.",
    en: "In 2017, the municipality announced plans for a hasty and ill-conceived renovation. The struggle to defend the city's primary green lung gave birth to the Φυλές του Πάρκου (Tribes of the Park) — an open assembly that took on its protection, its legal defence, and its management. Large marches took place, bringing tremendous momentum to the events held there, as well as to the broader appropriation, shaping, and understanding of this space as a common. Stoa60 held its very first event there back in 2015, even before the underground venue on Kalokerinou Street had been set up, and during the mobilization of 2018 they were there again, staging a series of screenings and memorable live shows.\n\nIn October 2019, following the most active summer the park had seen in terms of cultural life, with the legal battle still dragging on, the municipality, the contractor, and the riot police decided to push ahead with the renovation works. On that day, the wider community that had united around this struggle clashed with the police, won that particular battle — but could not hold out against the daily pressure of police enforcement and their excavators. The park was wrapped in corrugated iron sheeting, and it would take two to three years and a good stretch of lockdown before we would see it again. When it finally reopened, it did so under an entirely different regime. The main space that used to host live music now holds the massive umbrellas of a café operated by a private individual; there is a security guard permanently stationed on the premises; and the conditions for obtaining a permit are now dictated by the breeding season of various bird species.",
  },
  // ─── BA2037 ───
  "ba2037.intro": {
    el: "Η ΒΑ2037 λειτούργησε από τα τέλη του '18 μέχρι περίπου το 2021, υπήρξε οργανικό κομμάτι της στοάς60 με αρκετά κοινά μέλη και επικεντρωνόταν στον ηλεκτρονικό και πειραματικό ήχο. Ακολουθεί το αυτοπαρουσιαστικό της κείμενο.",
    en: "BA2037 was active from late 2018 until roughly 2021. An integral part of Stoa60 with several shared members, focused on electronic and experimental sound. This is how they introduced themselves back in the day.",
  },
  "ba2037.quote": {
    el: "Η ομάδα αποτελείται από μουσικούς, μουσικόφιλους και Djs με κοινή επιθυμία να βρούμε χώρο και χρόνο στο Ηράκλειο να ακούσουμε /παίξουμε / χορέψουμε / αναπαράγουμε τη μουσική που γουστάρουμε. Κινούμαστε στον ωκεανό της ηλεκτρονικής και πειραματικής μουσικής και θα θελαμε να προσεγγίσουμε τα βάθη της.\n\nΕπιδιώκουμε να δώσουμε χώρο σε μουσική η οποία δεν ακούγεται σε μέρη που συχνά διασκεδάζουμε, δεν προωθείται από την κυρίαρχη μουσική βιομηχανία και πολλές φορές ειναι αποτελεσμα αυτοσχεδιασμού και πειραματισμού. Σκοπεύουμε στην ανάδειξη και ανακάλυψη διαφόρων και διαφορετικών αισθήσεων, αισθητικών, τρόπων απόλαυσης και επικοινωνίας, τρόπων δημιουργίας και έκφρασης γύρω από την ηλεκτρονική και πειραματική μουσική.\n\nΣτόχος μας είναι η διοργάνωση μουσικών εκδηλώσεων και η συνεργασία με άλλους ανάλογους χώρους και πρωτοβουλίες στο Ηρακλειο με κοινές επιδιώξεις, τρόπους λειτουργίας και ύπαρξης.\n\nΥπάρχουμε ανεξάρτητα και αντιεραρχικά, χωρίς χορηγούς, έξω από μαγαζιά, χωρίς να αποσκοπούμε με κανένα τρόπο σε προσωπικό οικονομικό κέρδος, ουτε εμείς αλλά ούτε και οι καλλιτέχνες που φιλοξενούνται στα live. Σε όλες τις εκδηλώσεις που διοργανώνονται η είσοδος είναι ελεύθερη, καθως δεν θελουμε να αποκλείσουμε κανέναν και καμία. Παρόλα αυτά θεωρούμε την ενίσχυση μέσω του κουτιού απαραίτητη για την κάλυψη των λειτουργικών εξόδων, τοσο της ομάδας όσο και των χώρων που ενίοτε μας φιλοξενούν (Στοα 60) καθώς και για την συνέχιση και αναβάθμιση του όλου εγχειρήματος.\n\nΈχουμε ανάγκη να διαμορφώσουμε εκείνες τις συνθήκες μέσα στις οποίες κάθε άτομο θα μπορέσει να απολαύσει την μουσική, να εκφραστεί όπως νιώθει και κάθε σώμα θα έχει ίση ευκαιρία να διεκδικήσει το χώρο ανάμεσα στα άλλα χωρίς να περιορίζεται και να περιορίζει. Θα θέλαμε οι συναντήσεις που διοργανώνουμε εμείς να αποτελούν ασφαλείς χώρους για όλα τα άτομα και έτσι ομοφοβικές, εξουσιαστικές, τρανσφοβικές, σεξιστικές, ρατσιστικές και άλλες συμπεριφορές έκφρασης μίσους που επιβάλλονται βίαια πάνω σε αυτονόητες ελευθερίες, δεν είναι ανεκτές.\n\nSee you on the dancefloor",
    en: "The project consists of people that are interested in music, musicians and Djs with common desire to find space and time in order to listen/play/dance/(re) produce the music that we enjoy. We find ourselves somewhere in the ocean of electronic and experimental music and we would like to access the very depths of it.\n\nWe want to create room to music that does not exist to places that we usually get entertained, music that is not being promoted by the main music industry and music that, from time to time, is a result of our improvisation and experimentation. We are targeting to the prominence and discovery of different kinds of consciousness, feelings, ways of joy and communication, ways of creation and expression that are being surrounded by the electronic and experimental music.\n\nOur target is the organization of electronic music events and the cooperation with other equivalent groups, teams and initiatives that exists in Heraklion which serves the same goals, modes of operation and existence.\n\nWe exist independently and non-hierarchically, with no sponsors, outside of stores, bars, clubs, with no intention to gain in any way any personal financial profit, neither us nor the artists that are coming to perform. To all of our events there is a free entrance in order for nobody to be excluded. Nonetheless, we believe that the enhancement through the box is necessary to cover the functional expenses of the team and groups/teams/projects that we are cooperating (Stoa60) as well as for the continuation of the whole project.\n\nWe feel the need to create these circumstances where each person will be able to enjoy the music, to express theirself as they feel and every human body will have equal opportunities to claim its own space between the space of the others without creating constraints and without being constrained. The meetings that we organise, we imagine them as meetings where the place is safe for each and every person, thus, homophobic, authoritative, transphobic, sexistic and other behaviors of racist nature are not going to be accepted/tolerated.\n\nSee you on the dancefloor!",
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
