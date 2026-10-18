package app.mindcraft.estudos;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.provider.OpenableColumns;
import android.util.Base64;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.OutputStream;

/**
 * "Salvar como" do Android: abre o seletor de documentos do sistema (ACTION_CREATE_DOCUMENT), onde a pessoa ESCOLHE A PASTA E EDITA O NOME
 * (Downloads, Google Drive, cartão SD…), e depois grava os bytes nesse arquivo — quantas vezes quiser (Ctrl+S continua atualizando o mesmo arquivo).
 * A permissão de escrita é guardada (takePersistableUriPermission) para valer depois que o app for fechado.
 */
@CapacitorPlugin(name = "SaveFile")
public class SaveFilePlugin extends Plugin {

    @PluginMethod
    public void pick(PluginCall call) {
        String name = call.getString("name", "mapa.mom");
        String mime = call.getString("mime", "application/octet-stream");
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(mime);
        intent.putExtra(Intent.EXTRA_TITLE, name);
        startActivityForResult(call, intent, "pickResult");
    }

    @ActivityCallback
    private void pickResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            call.reject("Cancelado", "CANCELED");
            return;
        }
        Uri uri = result.getData().getData();
        try {
            getContext().getContentResolver().takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
        } catch (Exception ignored) { /* nem todo provedor oferece permissão persistente: vale para esta sessão */ }
        JSObject out = new JSObject();
        out.put("uri", uri.toString());
        out.put("name", displayName(uri));
        call.resolve(out);
    }

    @PluginMethod
    public void write(PluginCall call) {
        String uriText = call.getString("uri");
        String data = call.getString("data");
        if (uriText == null || data == null) { call.reject("Faltam uri e data."); return; }
        try {
            byte[] bytes = Base64.decode(data, Base64.DEFAULT);
            ContentResolver cr = getContext().getContentResolver();
            Uri uri = Uri.parse(uriText);
            try (OutputStream os = cr.openOutputStream(uri, "wt")) {      // "wt": substitui o conteúdo inteiro (arquivo menor não deixa sobra)
                if (os == null) { call.reject("O local escolhido não aceita gravação."); return; }
                os.write(bytes);
                os.flush();
            }
            JSObject out = new JSObject();
            out.put("bytes", bytes.length);
            out.put("name", displayName(uri));
            call.resolve(out);
        } catch (Exception e) {
            call.reject("Não consegui gravar: " + e.getMessage(), e);
        }
    }

    private String displayName(Uri uri) {
        try (Cursor c = getContext().getContentResolver().query(uri, new String[]{OpenableColumns.DISPLAY_NAME}, null, null, null)) {
            if (c != null && c.moveToFirst()) return c.getString(0);
        } catch (Exception ignored) { /* sem nome: usa o fim do caminho */ }
        String last = uri.getLastPathSegment();
        return last == null ? "arquivo" : last;
    }
}
