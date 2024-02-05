export default function PrivacyPolicy() {
  return (
    <main className="relative flex flex-1 flex-grow flex-col items-center justify-start overflow-visible bg-primary-700 p-2 text-white">
      <div className="container mb-10 flex h-full flex-col items-center justify-start">
        <h1 className="sm:text-4xl pb-14 pt-10 text-2xl font-extrabold tracking-tight">
          Πολιτική Απορρήτου
        </h1>
        <p className="mb-4 font-light">
          Η παρούσα Πολιτική Απορρήτου περιγράφει τους τρόπους συλλογής, χρήσης
          και προστασίας των προσωπικών σας δεδομένων κατά την επίσκεψη και
          χρήση της ιστοσελίδας PharmaFinder, η οποία έχει ως σκοπό να παρέχει
          πληροφορίες για τα εφημερεύοντα φαρμακεία στην Ελλάδα.
        </p>
        <h1 className="mb-2 text-xl font-bold">Συλλογή Δεδομένων</h1>
        <ol className="list-decimal space-y-2">
          <li>
            <span className="font-extrabold">Δεδομένα Τοποθεσίας</span>
            <p className="font-light">
              Ζητάμε τη συγκατάθεσή σας για πρόσβαση στην τοποθεσία σας μέσω της
              συσκευής σας για να σας παρέχουμε τις πληροφορίες για τα
              κοντινότερα εφημερεύοντα φαρμακεία. Εάν δεν παρέχετε συγκατάθεση,
              χρησιμοποιούμε την IP διεύθυνσή σας για μια εκτίμηση της
              τοποθεσίας σας.
            </p>
          </li>
          <li>
            <span className="font-extrabold">Προτιμήσεις Θέματος </span>{" "}
            <p className="font-light">
              Αποθηκεύουμε τις προτιμήσεις σας για το σκοτεινό ή φωτεινό θέμα
              της ιστοσελίδας στην τοπική αποθήκευση της συσκευής σας.
            </p>
          </li>
        </ol>
        <h1 className="mb-2 text-xl font-bold">Χρήση Δεδομένων</h1>
        <p className="font-light">
          Τα δεδομένα που συλλέγουμε χρησιμοποιούνται για να σας παρέχουμε τις
          υπηρεσίες μας, όπως τις πληροφορίες για τα εφημερεύοντα φαρμακεία, να
          βελτιώσουμε την εμπειρία σας στην ιστοσελίδα μας και να αναπτύξουμε
          νέες λειτουργίες και υπηρεσίες.
        </p>
        <h1 className="mb-2 text-xl font-bold">Προστασία Δεδομένων</h1>
        <p className="font-light">
          Λαμβάνουμε όλα τα απαραίτητα μέτρα για να διασφαλίσουμε την ασφάλεια
          και την εμπιστευτικότητα των προσωπικών σας δεδομένων.
        </p>
        <h1 className="mb-2 text-xl font-bold">Επικοινωνία</h1>
        <p className="font-light">
          Για οποιαδήποτε ερώτηση ή αίτηση σχετικά με την πολιτική απορρήτου ή
          τα προσωπικά σας δεδομένα, παρακαλούμε επικοινωνήστε στο{" "}
          <a
            href="mailto:iliascodes@gmail.com"
            className="font-bold text-complementary-200 hover:underline"
          >
            email εδώ
          </a>
          .
        </p>
      </div>
    </main>
  );
}
