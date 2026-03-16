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
  "about.intro":     { el: "Η Στοα 60 είναι μία ομάδα που διοργανώνει συναυλίες σχεδόν εβδομαδιαία από το 2015, σε ένα υπόγειο στο κέντρο του Ηρακλείου Κρήτης.", en: "Stoa 60 is a self-managed underground concert venue in the center of Heraklion Crete, that has operated nearly every Saturday since 2015, organizing over 250 gigs during this span." },
  "about.manifesto": { el: "Φιλοξενούμε σχήματα της ανεξάρτητης μουσικής σκηνής και επιλέγουμε να λειτουργούμε ανταγωνιστικά στη λογική του κέρδους και της σύγχρονης βιομηχανίας του θεάματος. Προσπαθούμε να φτιάχνουμε ένα περιβάλλον ισότητας, χωρίς διαχωρισμούς μεταξύ μουσικών-κοινού-διοργανωτών, χωρίς περιορισμούς σε μουσικά είδη και ενάντια σε σεξιστικές, φασιστικές και ρατσιστικές συμπεριφορές. Βλέπουμε την μουσική σαν ένα μέσο έκφρασης, διάδοσης ιδεών και αφορμή κοινωνικοποίησης, αλληλεπίδρασης και συνδιαμόρφωσης. Το κουτί ενίσχυσης και η ελεύθερη ενίσχυση στο Bar καλύπτουν τα λειτουργικά έξοδα του χώρου και του εξοπλισμού καθώς και τα μεταφορικά έξοδα για να ταξιδεύουν σχήματα από όλη την Ελλάδα.", en: "It's been the only venue on the island of Crete that consistently hosts non-mainstream music from all over Greece, and we approach it with a hands-on DIY ethic. By decommodifying all aspects of a gig, we've created an independent space that's genuinely accessible to everyone. We see music as a means of expression, idea-sharing, and community-building. Income to support this venture comes from voluntary contributions to a donation box and bar. Suggested prices are kept at a minimum and reflect actual costs: equipment, rent, electricity, and most critically, band transportation. Any surplus goes directly back into improving the infrastructure or supporting other ventures in the city of Heraklion. Our sustainability depends on collective participation: organizers, musicians, and audience together." },

  // ─── Works / Posters ───
  "works.title":      { el: "Posters", en: "Posters" },
  "works.print_link": { el: "ΑΡΧΕΙΑ ΑΦΙΣΩΝ ΠΡΟΣ ΕΚΤΥΠΩΣΗ", en: "Posters in high quality for printing" },
  "works.poster_alt": { el: "Αφίσα από", en: "Poster from" },

  // ─── Footer ───
  "footer.contact": { el: "Contact:", en: "Contact:" },

  // ─── 404 ───
  "404.title":   { el: "Page Not Found", en: "Page Not Found" },
  "404.message": { el: "Oops! It seems the page you are trying to access is broken or does not exist!", en: "Oops! It seems the page you are trying to access is broken or does not exist!" },
  "404.back":    { el: "Go back to the homepage", en: "Go back to the homepage" },
};
