export type Lang = "el" | "en";

export const translations: Record<string, Record<Lang, string>> = {
  // ─── Navigation ───
  "nav.home":    { el: "Home", en: "Home" },
  "nav.posters": { el: "Posters", en: "Posters" },
  "nav.about":   { el: "About", en: "About" },

  // ─── Hero (Home) ───
  "hero.title":       { el: "STOA60", en: "STOA60" },
  "hero.subtitle1":   { el: "underground venue in Iraqlion,", en: "underground venue in Iraqlion," },
  "hero.subtitle2":   { el: "10 years, few hundred gigs and counting.", en: "10 years, few hundred gigs and counting." },
  "hero.nextgig":     { el: "next gig", en: "next gig" },
  "hero.arrows":      { el: "<<<<<<<<<<<<", en: "<<<<<<<<<<<<" },
  "hero.newsletter":  { el: "gig mail alert", en: "gig mail alert" },
  "hero.placeholder": { el: "your@email.com", en: "your@email.com" },
  "hero.subscribe":   { el: "Subscribe", en: "Subscribe" },

  // ─── About ───
  "about.title":     { el: "about", en: "about" },
  "about.intro":     { el: "Η Στοα 60 είναι μία ομάδα που οργανώνει συναυλίες σχεδόν εβδομαδιαία εδώ και μία δεκαετία, σε ένα υπόγειο στο κέντρο του Ηρακλείου Κρήτης.", en: "Stoa 60 is a self-managed underground concert venue that has operated nearly every Saturday (except summer and covid) since 2015, organizing over 250 gigs during this span." },
  "about.manifesto": { el: "Η ομάδα στηρίζει την ανεξάρτητη μουσική σκηνή και δεν βασίζεται στη λογική του κέρδους και της βιομηχανίας του θεάματος. Λειτουργεί σε ένα πλαίσιο ισότητας, χωρίς διαχωρισμούς μεταξύ μουσικών-κοινού-διοργανωτών, χωρίς περιορισμούς σε μουσικά είδη και ενάντια σε σεξιστικές, φασιστικές και ρατσιστικές συμπεριφορές. Βλέπουμε την μουσική σαν ένα μέσο έκφρασης, διάδοσης ιδεών και αφορμή κοινωνικοποίησης, αλληλεπίδρασης και συνδιαμόρφωσης. Τα λειτουργικά έξοδα καλύπτονται αποκλειστικά από το κουτί ενίσχυσης και το Bar, που λειτουργούν με ελεύθερη συνεισφορά.", en: "It's been the only venue on the island of Crete that consistently hosts non-mainstream music from all over Greece, and we approach it with a hands-on DIY ethic—maintaining infrastructure, making our own gear, and brewing our own draft beer. By decommodifying all aspects of a gig, we've created an independent space that's genuinely accessible to everyone. We see music as a means of expression, idea-sharing, and community-building. Income to support this venture comes from voluntary contributions to a donation box and bar. Suggested prices are kept at a minimum and reflect actual costs: equipment, rent, electricity, and most critically, band transportation. Being on an island, every band must pay for flights or ferries to reach Crete, which is by far our biggest financial challenge. Any surplus goes directly back into improving the infrastructure or supporting other ventures in the city of Heraklion. Everyone involved works voluntarily, no one receives payment for his contribution to organise a gig and host the band for the weekend. Our sustainability depends on collective participation: organizers, musicians, and audience together." },

  // ─── Works / Posters ───
  "works.title":      { el: "Posters", en: "Posters" },
  "works.poster_alt": { el: "Αφίσα από", en: "Poster from" },

  // ─── Footer ───
  "footer.contact": { el: "Contact:", en: "Contact:" },

  // ─── 404 ───
  "404.title":   { el: "Page Not Found", en: "Page Not Found" },
  "404.message": { el: "Oops! It seems the page you are trying to access is broken or does not exist!", en: "Oops! It seems the page you are trying to access is broken or does not exist!" },
  "404.back":    { el: "Go back to the homepage", en: "Go back to the homepage" },
};
