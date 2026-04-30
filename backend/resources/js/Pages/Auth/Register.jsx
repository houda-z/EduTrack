import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        prenom: '',
        email: '',
        password: '',
        password_confirmation: '',
        filiere: '',
        groupe: '',
        telephone: '',
        annee: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };
    const filieres1ere = ['Développement Digital', 'Infrastructure Digitale', 'Intelligence Artificielle'];
    const filieres2eme = ['Full Stack Web', 'Cyber Sécurité'];

    const filiereOptions = data.annee === '1ère année' ? filieres1ere
        : data.annee === '2ème année' ? filieres2eme
            : [];
    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit}>

                {/* Nom */}
                <div>
                    <InputLabel htmlFor="name" value="Nom" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                {/* Prénom */}
                <div className="mt-4">
                    <InputLabel htmlFor="prenom" value="Prénom" />
                    <TextInput
                        id="prenom"
                        name="prenom"
                        value={data.prenom}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('prenom', e.target.value)}
                        required
                    />
                    <InputError message={errors.prenom} className="mt-2" />
                </div>

                {/* Email */}
                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* Mot de passe */}
                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Mot de passe" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Confirmer mot de passe */}
                <div className="mt-4">
                    <InputLabel htmlFor="password_confirmation" value="Confirmer mot de passe" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>
                {/* Téléphone */}
                <div className="mt-4">
                    <InputLabel htmlFor="telephone" value="Téléphone" />
                    <TextInput
                        id="telephone"
                        name="telephone"
                        value={data.telephone}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('telephone', e.target.value)}
                    />
                    <InputError message={errors.telephone} className="mt-2" />
                </div>

                {/* Année */}
                <div className="mt-4">
                    <InputLabel htmlFor="annee" value="Année" />
                    <select
                        id="annee"
                        name="annee"
                        value={data.annee}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        onChange={(e) => setData('annee', e.target.value)}
                    >
                        <option value="">-- Choisir --</option>
                        <option value="1ère année">1ère année</option>
                        <option value="2ème année">2ème année</option>
                    </select>
                    <InputError message={errors.annee} className="mt-2" />
                </div>

                {/* Filière */}
                <div className="mt-4">
                    <InputLabel htmlFor="filiere" value="Filière" />
                    <select
                        id="filiere"
                        name="filiere"
                        value={data.filiere}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        onChange={(e) => setData('filiere', e.target.value)}
                        disabled={!data.annee}
                        required
                    >
                        <option value="">-- Choisir une filière --</option>
                        {filiereOptions.map((f) => (
                            <option key={f} value={f}>{f}</option>
                        ))}
                    </select>
                    <InputError message={errors.filiere} className="mt-2" />
                </div>

                {/* Groupe */}
                <div className="mt-4">
                    <InputLabel htmlFor="groupe" value="Groupe" />
                    <select
                        id="groupe"
                        name="groupe"
                        value={data.groupe}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        onChange={(e) => setData('groupe', e.target.value)}
                        disabled={!data.filiere}
                        required
                    >
                        <option value="">-- Choisir un groupe --</option>
                        <option value="Groupe A">Groupe A</option>
                        <option value="Groupe B">Groupe B</option>
                    </select>
                    <InputError message={errors.groupe} className="mt-2" />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Déjà inscrit ?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        S'inscrire
                    </PrimaryButton>
                </div>

            </form>
        </GuestLayout>
    );
}